import io from 'socket.io';
import {StrMap} from './util/Types';
import { Packet, PacketType } from './Packets';
import Game from './Game';

type PacketHandler = (socket: io.Socket, packet: Packet) => void;

class Server {
  private server: io.Server;
  private sockets: StrMap<io.Socket>;
  private handlers: StrMap<PacketHandler>;
  private games: Game[];

  // queues
  private queue1v1: io.Socket[];

  constructor(server: io.Server) {
    this.server = server;
    this.sockets = {};
    this.handlers = {};
    this.games = [];
    this.queue1v1 = [];

    this.server.on('connection', this.onSocketConnected.bind(this));
    this.initNetworkHandlers();
  }
  
  public on(type: PacketType, handler: PacketHandler): void {
    this.handlers[type] = handler;
  }

  public sendDataTo(socket: io.Socket, packet: Packet): void {
    socket.emit('data_packet', packet);
  }
  
  private initNetworkHandlers(): void {
    this.on(PacketType.C_1V1_ENTER_QUEUE, this.handleEnterQueue1v1.bind(this));
  }
  
  private onSocketConnected(socket: io.Socket): void {
    console.log(`Connection from ${socket.conn.remoteAddress}.`)

    // listen for events 
    socket.on('disconnect', () => this.onSocketDisconnected(socket));
    socket.on('data_packet', data => this.handleEvent(socket, data));

    // add to socket list
    this.sockets[socket.conn.id] = socket;
  }

  private onSocketDisconnected(socket: io.Socket): void {
    console.log(`Client ${socket.conn.remoteAddress} disconnected.`);
    socket.removeAllListeners();
    delete this.sockets[socket.conn.id];
  }

  private handleEvent(socket: io.Socket, packet: Packet): void {
    const handler = this.handlers[packet.type];
    if (handler != null) {
      handler(socket, packet);
    }
  }

  private handleEnterQueue1v1(socket: io.Socket, packet: Packet): void {
    // check if someone else is in queue
    if (this.queue1v1.length > 0) {
      const other = this.queue1v1.shift()!;
      this.sendDataTo(socket, {
        type: PacketType.S_1v1_ENTER_GAME,
        data: {otherID: other.conn.id},
      });

      this.sendDataTo(other, {
        type: PacketType.S_1v1_ENTER_GAME,
        data: {otherID: socket.conn.id},
      });

      const game = new Game([socket, other]);
      this.games.push(game);
      return;
    }

    // add to queue
    this.queue1v1.push(socket);
  }
}

export default Server;