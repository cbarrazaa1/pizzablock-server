"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var HttpServer_1 = require("./HttpServer");
var port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000);
var host = String((_b = process.env.HOST) !== null && _b !== void 0 ? _b : '0.0.0.0');
HttpServer_1.httpServer.listen(port, host, function () {
    console.log("Started PizzaBlock Server on port " + port + ".");
});
//# sourceMappingURL=App.js.map