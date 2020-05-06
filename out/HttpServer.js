"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var cors_1 = __importDefault(require("cors"));
var expressApp = express_1.default();
expressApp.use(cors_1.default({ origin: 'http://localhost:3000', credentials: true }));
exports.httpServer = http_1.default.createServer(expressApp);
//# sourceMappingURL=HttpServer.js.map