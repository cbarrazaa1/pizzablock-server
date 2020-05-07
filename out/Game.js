"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = __importDefault(require("./Player"));
var Server_1 = require("./Server");
var Packets_1 = require("./Packets");
var UserController_1 = require("./api/UserController");
var GameController_1 = require("./api/GameController");
var VisitorController_1 = require("./api/VisitorController");
var Game = /** @class */ (function () {
    function Game(id, playerInfo, initialLevel) {
        var _this = this;
        this.id = id;
        this.players = {};
        this.handlers = {};
        this.initialLevel = initialLevel;
        this.hasEnded = false;
        this.handleEvent = this.handleEvent.bind(this);
        playerInfo.forEach(function (info) {
            var player = new Player_1.default(info.socket, initialLevel, info.id, info.name);
            player.packetHandler = function (data) {
                _this.handleEvent(player.socket, data);
            };
            player.disconnectedHandler = function () {
                _this.onPlayerDisconnected(player);
            };
            _this.players[info.socket.conn.id] = player;
            player.socket.on('data_packet', player.packetHandler);
            player.socket.on('disconnect', player.disconnectedHandler);
        });
        VisitorController_1.VisitorController.createVisitors({
            ip_addresses_list: playerInfo.map(function (info) { return info.socket.conn.remoteAddress; }),
        });
        this.initNetworkHandlers();
    }
    Game.prototype.onPlayerDisconnected = function (player) {
        player.gameOver = true;
        player.score = -999999;
        this.sendGameOver(player);
        this.checkGameOver();
    };
    Game.prototype.on = function (type, handler) {
        this.handlers[type] = handler;
    };
    Game.prototype.sendDataToAll = function (packet) {
        Object.values(this.players).forEach(function (player) {
            Server_1.server.sendDataTo(player.socket, packet);
        });
    };
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
    Game.prototype.sendGameOver = function (who) {
        this.sendDataToAllBut(who.socket, new Packets_1.GameOverPacket({
            whoID: who.id,
        }));
    };
    Game.prototype.sendEndGame = function (winner) {
        this.sendDataToAll(new Packets_1.EndGamePacket({
            winnerID: winner.id,
        }));
        this.hasEnded = true;
        Object.values(this.players).forEach(function (player) {
            player.socket.removeListener('data_packet', player.packetHandler);
            player.socket.removeListener('disconnect', player.disconnectedHandler);
        });
    };
    Game.prototype.initNetworkHandlers = function () {
        this.on(Packets_1.PacketType.C_PLACE_BLOCK, this.handlePlaceBlock.bind(this));
    };
    Game.prototype.handleEvent = function (socket, packet) {
        var handler = this.handlers[packet.type];
        if (handler != null) {
            handler(socket, packet);
        }
    };
    Game.prototype.handlePlaceBlock = function (socket, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var block, x, y, data, player, playersList, clearedLines;
            return __generator(this, function (_a) {
                block = packet.data;
                x = block.x, y = block.y, data = block.data;
                player = this.players[socket.conn.id];
                playersList = Object.values(this.players);
                clearedLines = player.updateBoard(x, y, data);
                // check for this player's game over
                if (player.gameOver) {
                    this.sendGameOver(player);
                }
                // check if game has ended
                this.checkGameOver();
                // send update to other players
                this.sendPlayerPlaceBlock(player, packet, clearedLines);
                return [2 /*return*/];
            });
        });
    };
    Game.prototype.checkGameOver = function () {
        var playersList = Object.values(this.players);
        var gameEnded = true;
        var winner = {
            id: '',
            socketID: '',
            score: 0,
        };
        playersList.forEach(function (player) {
            if (!player.gameOver) {
                gameEnded = false;
                return;
            }
            if (player.socket.disconnected) {
                return;
            }
            if (player.score >= winner.score) {
                winner.id = player.id;
                winner.socketID = player.socket.conn.id;
                winner.score = player.score;
            }
        });
        if (gameEnded) {
            // add the game to the players
            UserController_1.UserController.updateUsersByIDs({
                user_list: playersList.map(function (player) { return player.id; }),
                game_id: this.id,
            });
            GameController_1.GameController.updateGameById(this.id, {
                user_id_list: playersList
                    .filter(function (player) { return player.id !== winner.id; })
                    .map(function (player) { return player.id; }),
                winner: winner.id,
            });
            this.sendEndGame(this.players[winner.socketID]);
        }
    };
    return Game;
}());
exports.default = Game;
//# sourceMappingURL=Game.js.map