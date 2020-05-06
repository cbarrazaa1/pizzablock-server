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
var Packets_1 = require("./Packets");
var Game_1 = __importDefault(require("./Game"));
var GameController_1 = require("./api/GameController");
var Server = /** @class */ (function () {
    function Server(server) {
        var _this = this;
        this.server = server;
        this.sockets = {};
        this.handlers = {};
        this.games = [];
        this.queue1v1 = [];
        this.server.on('connection', this.onSocketConnected.bind(this));
        this.initNetworkHandlers();
        // check for ended games periodically
        setInterval(function () {
            var gamesToRemove = [];
            _this.games.forEach(function (game, i) {
                if (game.hasEnded) {
                    gamesToRemove.push(i);
                }
            });
            gamesToRemove.forEach(function (index) {
                console.log("Removing game " + index);
                _this.games.splice(index, 1);
            });
        }, 30000);
    }
    Server.prototype.on = function (type, handler) {
        this.handlers[type] = handler;
    };
    Server.prototype.sendDataTo = function (socket, packet) {
        socket.emit('data_packet', packet);
    };
    Server.prototype.initNetworkHandlers = function () {
        this.on(Packets_1.PacketType.C_1V1_ENTER_QUEUE, this.handleEnterQueue1v1.bind(this));
    };
    Server.prototype.onSocketConnected = function (socket) {
        var _this = this;
        console.log("Connection from " + socket.conn.remoteAddress + ".");
        // listen for events
        socket.on('disconnect', function () { return _this.onSocketDisconnected(socket); });
        socket.on('data_packet', function (data) { return _this.handleEvent(socket, data); });
        // add to socket list
        this.sockets[socket.conn.id] = socket;
    };
    Server.prototype.onSocketDisconnected = function (socket) {
        console.log("Client " + socket.conn.remoteAddress + " disconnected.");
        socket.removeAllListeners();
        delete this.sockets[socket.conn.id];
    };
    Server.prototype.sendEnterGame = function (socket, other, initialLevel) {
        this.sendDataTo(socket, new Packets_1.EnterGamePacket({
            otherID: other.id,
            initialLevel: initialLevel,
            otherName: other.name,
        }));
    };
    Server.prototype.handleEvent = function (socket, packet) {
        var handler = this.handlers[packet.type];
        if (handler != null) {
            handler(socket, packet);
        }
    };
    Server.prototype.handleEnterQueue1v1 = function (socket, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var thisOne, other, gameID, game;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.queue1v1.length > 0)) return [3 /*break*/, 2];
                        thisOne = {
                            socket: socket,
                            id: packet.data.userID,
                            name: packet.data.name,
                        };
                        other = this.queue1v1.shift();
                        // notify players that game started
                        this.sendEnterGame(socket, other, 9);
                        this.sendEnterGame(other.socket, thisOne, 9);
                        return [4 /*yield*/, GameController_1.GameController.createGame({
                                mode_id: '5eab7d278c3f100017bdcbb1',
                                money_pool: 0,
                            })];
                    case 1:
                        gameID = _a.sent();
                        game = new Game_1.default(gameID, [thisOne, other], 9);
                        this.games.push(game);
                        return [2 /*return*/];
                    case 2:
                        // add to queue
                        this.queue1v1.push({
                            socket: socket,
                            id: packet.data.userID,
                            name: packet.data.name,
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Server;
}());
exports.default = Server;
var server;
exports.server = server;
function setServer(svr) {
    exports.server = server = svr;
}
exports.setServer = setServer;
//# sourceMappingURL=Server.js.map