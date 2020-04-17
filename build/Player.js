"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOARD_WIDTH = 10;
exports.BOARD_HEIGHT = 20;
var Player = /** @class */ (function () {
    function Player(socket) {
        this.socket = socket;
        this.board = new Array(exports.BOARD_WIDTH)
            .fill(null)
            .map(function () { return new Array(exports.BOARD_HEIGHT).fill(0); });
        this.lines = 0;
        this.level = 0;
        this.score = 0;
        this.lineCounter = 0;
    }
    Player.prototype.updateBoard = function (x, y, data) {
        var _this = this;
        var shapeWidth = data[0].length;
        var shapeHeight = data.length;
        // update the board matrix
        for (var i = 0; i < shapeHeight; i++) {
            for (var j = 0; j < shapeWidth; j++) {
                if (data[i][j] === 1) {
                    this.board[x + j][y + i] = 1;
                }
            }
        }
        // check for line clears
        var linesY = [];
        var _a = [y, y + shapeHeight - 1], startY = _a[0], endY = _a[1];
        var completedLine = true;
        for (var y_1 = startY; y_1 <= endY; y_1++) {
            for (var x_1 = 0; x_1 < exports.BOARD_WIDTH; x_1++) {
                if (this.board[x_1][y_1] !== 1) {
                    completedLine = false;
                    break;
                }
            }
            if (completedLine) {
                linesY.push(y_1);
            }
            else {
                completedLine = true;
            }
        }
        if (linesY.length > 0) {
            var sequentialClear = true;
            // check if lines were cleared separately
            if (linesY.length === 2) {
                if (linesY[1] - linesY[0] !== 1) {
                    sequentialClear = false;
                }
            }
            // shift blocks down
            var shiftBlocks = function (clearY, shiftCount) {
                for (var y_2 = clearY - 1; y_2 >= 0; y_2--) {
                    for (var x_2 = 0; x_2 < exports.BOARD_WIDTH; x_2++) {
                        _this.board[x_2][y_2 + shiftCount] = _this.board[x_2][y_2];
                        _this.board[x_2][y_2] = 0;
                    }
                }
            };
            if (sequentialClear) {
                shiftBlocks(linesY[0], linesY.length);
            }
            else {
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
        return linesY;
    };
    Player.prototype.calcLineClearScore = function (lineCount) {
        var base = 50;
        if (lineCount === 2) {
            base = 150;
        }
        else if (lineCount === 3) {
            base = 350;
        }
        else if (lineCount === 4) {
            base = 1000;
        }
        else if (lineCount === 0) {
            base = 0;
        }
        return base * (this.level + 1);
    };
    return Player;
}());
exports.default = Player;
//# sourceMappingURL=Player.js.map