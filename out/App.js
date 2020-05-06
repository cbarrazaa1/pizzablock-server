"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var HttpServer_1 = require("./HttpServer");
var socket_io_1 = __importDefault(require("socket.io"));
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var Server_1 = __importStar(require("./Server"));
var expressApp = express_1.default();
expressApp.use(cors_1.default({ origin: 'http://localhost:3000', credentials: true }));
Server_1.setServer(new Server_1.default(socket_io_1.default(HttpServer_1.httpServer)));
var port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000);
var host = String((_b = process.env.HOST) !== null && _b !== void 0 ? _b : '0.0.0.0');
HttpServer_1.httpServer.listen(port, host, function () {
    console.log("Started PizzaBlock Server on port " + port + ".");
});
//# sourceMappingURL=App.js.map