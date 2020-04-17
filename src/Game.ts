import io from 'socket.io';
import Player from './Player';
import {StrMap, Nullable} from './util/Types';
import {server} from './Server';
import {
  PacketType,
  Packet,
  PlaceBlockPacket,
  PlayerPlaceBlockPacket,
} from './Packets';

class Game {
  private players: StrMap<Player>;

  constructor(sockets: io.Socket[]) {
    this.players = {};
    sockets.forEach((socket) => {
      this.players[socket.conn.id] = new Player(socket);
    });

    this.initNetworkHandlers();
  }

  private sendDataToAllBut(socket: io.Socket, packet: Packet) {
    Object.values(this.players).forEach((player) => {
      if (socket.conn.id !== player.socket.conn.id) {
        server.sendDataTo(player.socket, packet);
      }
    });
  }

  private sendPlayerPlaceBlock(exclude: Player, packet: PlaceBlockPacket, clearedLines: number[]) {
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

  private initNetworkHandlers(): void {
    server.on(PacketType.C_1v1_PLACE_BLOCK, this.handlePlaceBlock.bind(this));
  }

  private handlePlaceBlock(socket: io.Socket, packet: PlaceBlockPacket): void {
    const block = packet.data;
    const {x, y, data} = block;
    const player = this.players[socket.conn.id];

    // update player's board
    const clearedLines = player.updateBoard(x, y, data);

    // send update to other players
    this.sendPlayerPlaceBlock(player, packet, clearedLines);
  }
}

export default Game;
