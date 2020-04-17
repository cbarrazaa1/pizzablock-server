"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = __importDefault(require("./Player"));
var Server_1 = require("./Server");
var Packets_1 = require("./Packets");
var Game = /** @class */ (function () {
    function Game(sockets) {
        var _this = this;
        this.players = {};
        sockets.forEach(function (socket) {
            _this.players[socket.conn.id] = new Player_1.default(socket);
        });
        this.initNetworkHandlers();
    }
    Game.prototype.sendDataToAllBut = function (socket, packet) {
        Object.values(this.players).forEach(function (player) {
            if (socket.conn.id !== player.socket.conn.id) {
                Server_1.server.sendDataTo(player.socket, packet);
            }
        });
    };
    Game.prototype.sendPlayerPlaceBlock = function (exclude, packet, clearedLines) {
        this.sendDataToAllBut(exclude.socket, new Packets_1.PlayerPlaceBlockPacket({
            block: packet.data,
            level: exclude.level,
            lines: exclude.lines,
            score: exclude.score,
            clearedLines: clearedLines,
        }));
    };
    Game.prototype.initNetworkHandlers = function () {
        Server_1.server.on(Packets_1.PacketType.C_1v1_PLACE_BLOCK, this.handlePlaceBlock.bind(this));
    };
    Game.prototype.handlePlaceBlock = function (socket, packet) {
        var block = packet.data;
        var x = block.x, y = block.y, data = block.data;
        var player = this.players[socket.conn.id];
        // update player's board
        var clearedLines = player.updateBoard(x, y, data);
        // send update to other players
        this.sendPlayerPlaceBlock(player, packet, clearedLines);
    };
    return Game;
}());
exports.default = Game;
//# sourceMappingURL=Game.js.map