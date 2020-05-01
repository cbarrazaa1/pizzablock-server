import io from 'socket.io';
import Player from './Player';
import {StrMap, Nullable} from './util/Types';
import {server, QueueItem} from './Server';
import {
  PacketType,
  Packet,
  PlaceBlockPacket,
  PlayerPlaceBlockPacket,
  GameOverPacket,
  EndGamePacket,
} from './Packets';
import {UserController} from './api/UserController';
import {GameController} from './api/GameController';

type PacketHandler = (socket: io.Socket, packet: Packet) => void;

class Game {
  private id: string;
  private players: StrMap<Player>;
  private handlers: StrMap<PacketHandler>;
  private initialLevel: number;
  public hasEnded: boolean;

  constructor(id: string, playerInfo: QueueItem[], initialLevel: number) {
    this.id = id;
    this.players = {};
    this.handlers = {};
    this.initialLevel = initialLevel;
    this.hasEnded = false;
    this.handleEvent = this.handleEvent.bind(this);
    playerInfo.forEach((info) => {
      const player = new Player(info.socket, initialLevel, info.id, info.name);
      player.packetHandler = (data: any) => {
        this.handleEvent(player.socket, data);
      };

      this.players[info.socket.conn.id] = player;
      player.socket.on('data_packet', player.packetHandler);
    });

    this.initNetworkHandlers();
  }

  private on(type: PacketType, handler: PacketHandler): void {
    this.handlers[type] = handler;
  }

  private sendDataToAll(packet: Packet): void {
    Object.values(this.players).forEach((player) => {
      server.sendDataTo(player.socket, packet);
    });
  }

  private sendDataToAllBut(socket: io.Socket, packet: Packet): void {
    Object.values(this.players).forEach((player) => {
      if (socket.conn.id !== player.socket.conn.id) {
        server.sendDataTo(player.socket, packet);
      }
    });
  }

  private sendPlayerPlaceBlock(
    exclude: Player,
    packet: PlaceBlockPacket,
    clearedLines: number[],
  ) {
    this.sendDataToAllBut(
      exclude.socket,
      new PlayerPlaceBlockPacket({
        block: packet.data,
        level: exclude.level,
        lines: exclude.lines,
        score: exclude.score,
        clearedLines,
      }),
    );
  }

  private sendGameOver(who: Player): void {
    this.sendDataToAllBut(
      who.socket,
      new GameOverPacket({
        whoID: who.id,
      }),
    );
  }

  private sendEndGame(winner: Player): void {
    this.sendDataToAll(
      new EndGamePacket({
        winnerID: winner.id,
      }),
    );

    this.hasEnded = true;
    Object.values(this.players).forEach((player) => {
      player.socket.removeListener('data_packet', player.packetHandler);
    });
  }

  private initNetworkHandlers(): void {
    this.on(PacketType.C_1v1_PLACE_BLOCK, this.handlePlaceBlock.bind(this));
  }

  private handleEvent(socket: io.Socket, packet: Packet): void {
    const handler = this.handlers[packet.type];
    if (handler != null) {
      handler(socket, packet);
    }
  }

  private async handlePlaceBlock(
    socket: io.Socket,
    packet: PlaceBlockPacket,
  ): Promise<void> {
    const block = packet.data;
    const {x, y, data} = block;
    const player = this.players[socket.conn.id];
    const playersList = Object.values(this.players);

    // update player's board
    const clearedLines = player.updateBoard(x, y, data);

    // check for this player's game over
    if (player.gameOver) {
      this.sendGameOver(player);
    }

    // check if game has ended
    let gameEnded = true;
    const winner = {
      id: '',
      score: 0,
    };

    playersList.forEach((player) => {
      if (!player.gameOver) {
        gameEnded = false;
        return;
      }

      if (player.score >= winner.score) {
        winner.id = player.socket.conn.id;
        winner.score = player.score;
      }
    });

    if (gameEnded) { 
      // add the game to the players
      UserController.updateUsersByIDs({
        user_list: playersList.map((player) => player.id),
        game_id: this.id,
      });

      GameController.updateGameById(this.id, {
        user_id_list: playersList
          .filter((player) => player.id !== winner.id)
          .map((player) => player.id),
        winner: winner.id,
      });
      this.sendEndGame(this.players[winner.id]);
    }

    // send update to other players
    this.sendPlayerPlaceBlock(player, packet, clearedLines);
  }
}

export default Game;
