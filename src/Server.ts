import io from 'socket.io';
import {StrMap} from './util/Types';
import {
  Packet,
  PacketType,
  EnterGame1v1Packet,
  EnterGame1v4Packet,
  EnterQueue1v1Packet,
  EnterQueue1v4Packet,
} from './Packets';
import Game from './Game';
import {GameController} from './api/GameController';

type PacketHandler = (socket: io.Socket, packet: Packet) => void;

export type QueueItem = {
  socket: io.Socket;
  id: string;
  name: string;
  ip: string;
};

export default class Server {
  private server: io.Server;
  private sockets: StrMap<io.Socket>;
  private handlers: StrMap<PacketHandler>;
  private games: Game[];

  // queues
  private queue1v1: QueueItem[];
  private queue1v4: QueueItem[];

  constructor(server: io.Server) {
    this.server = server;
    this.sockets = {};
    this.handlers = {};
    this.games = [];
    this.queue1v1 = [];
    this.queue1v4 = [];

    this.server.on('connection', this.onSocketConnected.bind(this));
    this.initNetworkHandlers();

    // check for ended games periodically
    setInterval(() => {
      const gamesToRemove: number[] = [];
      this.games.forEach((game, i) => {
        if (game.hasEnded) {
          gamesToRemove.push(i);
        }
      });

      gamesToRemove.forEach(index => {
        this.games.splice(index, 1);
      });
    }, 30000);
  }

  private on(type: PacketType, handler: PacketHandler): void {
    this.handlers[type] = handler;
  }

  public sendDataTo(socket: io.Socket, packet: Packet): void {
    socket.emit('data_packet', packet);
  }

  private initNetworkHandlers(): void {
    this.on(PacketType.C_1V1_ENTER_QUEUE, this.handleEnterQueue1v1.bind(this));
    this.on(PacketType.C_1v4_ENTER_QUEUE, this.handleEnterQueue1v4.bind(this));
  }

  private onSocketConnected(socket: io.Socket): void {
    console.log(`Connection from ${socket.conn.remoteAddress}.`);

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

  private sendEnterGame1v1(
    socket: io.Socket,
    other: QueueItem,
    initialLevel: number,
  ): void {
    this.sendDataTo(
      socket,
      new EnterGame1v1Packet({
        otherID: other.id,
        initialLevel,
        otherName: other.name,
      }),
    );
  }

  private sendEnterGame1v4(players: QueueItem[], initialLevel: number): void {
    players.forEach(player => {
      this.sendDataTo(
        player.socket,
        new EnterGame1v4Packet({
          others: players
            .filter(curr => curr.id !== player.id)
            .map(curr => ({
              id: curr.id,
              name: curr.name,
            })),
          initialLevel,
        }),
      );
    });
  }

  private handleEvent(socket: io.Socket, packet: Packet): void {
    const handler = this.handlers[packet.type];
    if (handler != null) {
      handler(socket, packet);
    }
  }

  private async handleEnterQueue1v1(
    socket: io.Socket,
    packet: EnterQueue1v1Packet,
  ): Promise<void> {
    // check if someone else is in queue
    if (this.queue1v1.length > 0) {
      const thisOne = {
        socket,
        id: packet.data.userID,
        name: packet.data.name,
        ip: packet.data.ip,
      };
      const other = this.queue1v1.shift()!;

      // notify players that game started
      this.sendEnterGame1v1(socket, other, 7);
      this.sendEnterGame1v1(other.socket, thisOne, 7);

      // create the game
      const gameID = await GameController.createGame({
        mode_id: '5eab7d278c3f100017bdcbb1',
        money_pool: 0,
      });
      const game = new Game(gameID, [thisOne, other], 7);
      this.games.push(game);
      return;
    }

    // add to queue
    this.queue1v1.push({
      socket,
      id: packet.data.userID,
      name: packet.data.name,
      ip: packet.data.ip,
    });
  }

  private async handleEnterQueue1v4(
    socket: io.Socket,
    packet: EnterQueue1v4Packet,
  ): Promise<void> {
    // check if queue has enough people
    if (this.queue1v4.length >= 4) {
      const players = [{
        socket,
        id: packet.data.userID,
        name: packet.data.name,
        ip: packet.data.ip,
      }];
      for (let i = 0; i < 4; i++) {
        players.push(this.queue1v4.shift()!);
      }

      // notify players
      this.sendEnterGame1v4(players, 7);

      // create the game
      const gameID = await GameController.createGame({
        mode_id: '5eab7d718c3f100017bdcbb2',
        money_pool: 0,
      });
      const game = new Game(gameID, players, 7);
      this.games.push(game);
      return;
    }

    // add to queue
    this.queue1v4.push({
      socket,
      id: packet.data.userID,
      name: packet.data.name,
      ip: packet.data.ip,
    });
  }
}

let server!: Server;

export function setServer(svr: Server): void {
  server = svr;
}

export {server};
