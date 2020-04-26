import io from 'socket.io';
import {StrMap} from './util/Types';
import {Packet, PacketType, EnterGamePacket, EnterQueuePacket} from './Packets';
import Game from './Game';

type PacketHandler = (socket: io.Socket, packet: Packet) => void;

export default class Server {
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

  private on(type: PacketType, handler: PacketHandler): void {
    this.handlers[type] = handler;
  }

  public sendDataTo(socket: io.Socket, packet: Packet): void {
    socket.emit('data_packet', packet);
  }

  private initNetworkHandlers(): void {
    this.on(PacketType.C_1V1_ENTER_QUEUE, this.handleEnterQueue1v1.bind(this));
  }

  private onSocketConnected(socket: io.Socket): void {
    console.log(`Connection from ${socket.conn.remoteAddress}.`);

    // listen for events
    socket.on('disconnect', () => this.onSocketDisconnected(socket));
    socket.on('data_packet', (data) => this.handleEvent(socket, data));

    // add to socket list
    this.sockets[socket.conn.id] = socket;
  }

  private onSocketDisconnected(socket: io.Socket): void {
    console.log(`Client ${socket.conn.remoteAddress} disconnected.`);
    socket.removeAllListeners();
    delete this.sockets[socket.conn.id];
  }

  private sendEnterGame(
    socket: io.Socket,
    other: io.Socket,
    initialLevel: number,
  ) {
    this.sendDataTo(
      socket,
      new EnterGamePacket({otherID: other.conn.id, initialLevel}),
    );
  }

  private handleEvent(socket: io.Socket, packet: Packet): void {
    const handler = this.handlers[packet.type];
    if (handler != null) {
      handler(socket, packet);
    }
  }

  private handleEnterQueue1v1(socket: io.Socket, _: EnterQueuePacket): void {
    // check if someone else is in queue
    if (this.queue1v1.length > 0) {
      const other = this.queue1v1.shift()!;
      const game = new Game([socket, other], 9);

      // notify players that game started
      this.sendEnterGame(socket, other, 9);
      this.sendEnterGame(other, socket, 9);

      this.games.push(game);
      return;
    }

    // add to queue
    this.queue1v1.push(socket);
  }
}

let server!: Server;

export function setServer(svr: Server): void {
  server = svr;
}

export {server};
