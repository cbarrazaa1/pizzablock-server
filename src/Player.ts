import io from 'socket.io';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

class Player {
  public socket: io.Socket;
  public board: number[][];
  public lines: number;
  public level: number;
  public score: number;

  constructor(socket: io.Socket) {
    this.socket = socket;
    this.board = new Array(BOARD_WIDTH)
      .fill(null)
      .map(() => new Array(BOARD_HEIGHT).fill(0));
    
    this.lines = 0;
    this.level = 0;
    this.score = 0;
  }
}

export default Player;