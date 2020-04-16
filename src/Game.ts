import io from 'socket.io';
import Player from "./Player";
import { StrMap } from "./util/Types";
import {server} from './App';
import { PacketType, Packet } from './Packets';

class Game {
  private players: StrMap<Player>;

  constructor(sockets: io.Socket[]) {
    this.players = {};
    sockets.forEach(socket => {
      this.players[socket.conn.id] = new Player(socket);
    })

    this.initNetworkHandlers();
  }

  private sendDataToAllBut(socket: io.Socket, packet: Packet) {
    Object.values(this.players).forEach(player => {
      if (socket.conn.id !== player.socket.conn.id) { 
        server.sendDataTo(player.socket, packet);
      }
    })
  }

  private initNetworkHandlers(): void {
    server.on(PacketType.C_1v1_PLACE_BLOCK, this.handlePlayerPlaceBlock.bind(this));
  }

  private handlePlayerPlaceBlock(socket: io.Socket, packet: Packet): void {
    this.sendDataToAllBut(socket, {
      type: PacketType.S_1v1_PLAYER_PLACE_BLOCK,
      data: packet.data,
    });
  }
}

export default Game;