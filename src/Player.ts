import io from 'socket.io';
import { Nullable } from './util/Types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type DataPacketHandler = (...args: any[]) => void;

class Player {
  public socket: io.Socket;
  public board: number[][];
  public lines: number;
  public level: number;
  public score: number;
  public gameOver: boolean;
  public packetHandler!: DataPacketHandler;
  private lineCounter: number;

  constructor(socket: io.Socket) {
    this.socket = socket;
    this.board = new Array(BOARD_WIDTH)
      .fill(null)
      .map(() => new Array(BOARD_HEIGHT).fill(0));

    this.lines = 0;
    this.level = 0;
    this.score = 0;
    this.lineCounter = 0;
    this.gameOver = false;
  }

  public updateBoard(x: number, y: number, data: number[][]): number[] {
    const shapeWidth = data[0].length;
    const shapeHeight = data.length;

    if (this.gameOver) {
      return [];
    }

    // update the board matrix
    for (let i = 0; i < shapeHeight; i++) {
      for (let j = 0; j < shapeWidth; j++) {
        if (data[i][j] === 1) {
          this.board[x + j][y + i] = 1;
        }
      }
    }

    // check for line clears
    const linesY: number[] = [];
    const [startY, endY] = [y, y + shapeHeight - 1];
    let completedLine = true;

    for (let y = startY; y <= endY; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (this.board[x][y] !== 1) {
          completedLine = false;
          break;
        }
      }
      
      if (completedLine) {
        linesY.push(y);
      } else {
        completedLine = true;
      }
    }

    if (linesY.length > 0) {
      let sequentialClear = true;

      // check if lines were cleared separately
      if (linesY.length === 2) {
        if (linesY[1] - linesY[0] !== 1) {
          sequentialClear = false;
        }
      }

      // shift blocks down
      const shiftBlocks = (clearY: number, shiftCount: number): void => {
        for (let y = clearY - 1; y >= 0; y--) {
          for (let x = 0; x < BOARD_WIDTH; x++) {
            this.board[x][y + shiftCount] = this.board[x][y];
            this.board[x][y] = 0;
          }
        }
      };

      if (sequentialClear) {
        shiftBlocks(linesY[0], linesY.length);
      } else {
        shiftBlocks(linesY[0], 1);
        shiftBlocks(linesY[1], 1);
      }
    }
    this.lines += linesY.length;
    this.lineCounter += linesY.length;
    this.score += this.calcLineClearScore(linesY.length);

    // check level up
    if (this.lineCounter >= 10) {
      this.level++;
      this.lineCounter = 0;
    }
    
    // check game over
    for (let x = 4; x <= 7; x++) {
      if (this.board[x][0] === 1) {
        this.gameOver = true;
      }
    }

    return linesY;
  }

  private calcLineClearScore(lineCount: number): number {
    let base = 50;
    if (lineCount === 2) {
      base = 150;
    } else if (lineCount === 3) {
      base = 350;
    } else if (lineCount === 4) {
      base = 1000;
    } else if (lineCount === 0) {
      base = 0;
    }

    return base * (this.level + 1);
  }
}

export default Player;
