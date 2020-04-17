"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var Packets_1 = require("./Packets");
var Game_1 = __importDefault(require("./Game"));
var HttpServer_1 = require("./HttpServer");
var Server = /** @class */ (function () {
    function Server(server) {
        this.server = server;
        this.sockets = {};
        this.handlers = {};
        this.games = [];
        this.queue1v1 = [];
        this.server.on('connection', this.onSocketConnected.bind(this));
        this.initNetworkHandlers();
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
        this.sendDataTo(socket, new Packets_1.EnterGamePacket({ otherID: other.conn.id, initialLevel: initialLevel }));
    };
    Server.prototype.handleEvent = function (socket, packet) {
        var handler = this.handlers[packet.type];
        if (handler != null) {
            handler(socket, packet);
        }
    };
    Server.prototype.handleEnterQueue1v1 = function (socket, _) {
        // check if someone else is in queue
        if (this.queue1v1.length > 0) {
            var other = this.queue1v1.shift();
            var game = new Game_1.default([socket, other]);
            // notify players that game started
            this.sendEnterGame(socket, other, 9);
            this.sendEnterGame(other, socket, 9);
            this.games.push(game);
            return;
        }
        // add to queue
        this.queue1v1.push(socket);
    };
    return Server;
}());
exports.server = new Server(socket_io_1.default(HttpServer_1.httpServer));
//# sourceMappingURL=Server.js.map