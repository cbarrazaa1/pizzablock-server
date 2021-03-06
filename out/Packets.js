"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PacketType;
(function (PacketType) {
    PacketType[PacketType["C_1V1_ENTER_QUEUE"] = 0] = "C_1V1_ENTER_QUEUE";
    PacketType[PacketType["C_PLACE_BLOCK"] = 1] = "C_PLACE_BLOCK";
    PacketType[PacketType["S_1v1_ENTER_GAME"] = 2] = "S_1v1_ENTER_GAME";
    PacketType[PacketType["S_PLAYER_PLACE_BLOCK"] = 3] = "S_PLAYER_PLACE_BLOCK";
    PacketType[PacketType["S_GAME_OVER"] = 4] = "S_GAME_OVER";
    PacketType[PacketType["S_END_GAME"] = 5] = "S_END_GAME";
})(PacketType = exports.PacketType || (exports.PacketType = {}));
var Packet = /** @class */ (function () {
    function Packet() {
        this.type = -1;
    }
    return Packet;
}());
exports.Packet = Packet;
var EnterQueuePacket = /** @class */ (function (_super) {
    __extends(EnterQueuePacket, _super);
    function EnterQueuePacket(data) {
        var _this = _super.call(this) || this;
        _this.type = PacketType.C_1V1_ENTER_QUEUE;
        _this.data = data;
        return _this;
    }
    return EnterQueuePacket;
}(Packet));
exports.EnterQueuePacket = EnterQueuePacket;
var PlaceBlockPacket = /** @class */ (function (_super) {
    __extends(PlaceBlockPacket, _super);
    function PlaceBlockPacket(data) {
        var _this = _super.call(this) || this;
        _this.type = PacketType.C_PLACE_BLOCK;
        _this.data = data;
        return _this;
    }
    return PlaceBlockPacket;
}(Packet));
exports.PlaceBlockPacket = PlaceBlockPacket;
var EnterGamePacket = /** @class */ (function (_super) {
    __extends(EnterGamePacket, _super);
    function EnterGamePacket(data) {
        var _this = _super.call(this) || this;
        _this.type = PacketType.S_1v1_ENTER_GAME;
        _this.data = data;
        return _this;
    }
    return EnterGamePacket;
}(Packet));
exports.EnterGamePacket = EnterGamePacket;
var PlayerPlaceBlockPacket = /** @class */ (function (_super) {
    __extends(PlayerPlaceBlockPacket, _super);
    function PlayerPlaceBlockPacket(data) {
        var _this = _super.call(this) || this;
        _this.type = PacketType.S_PLAYER_PLACE_BLOCK;
        _this.data = data;
        return _this;
    }
    return PlayerPlaceBlockPacket;
}(Packet));
exports.PlayerPlaceBlockPacket = PlayerPlaceBlockPacket;
var GameOverPacket = /** @class */ (function (_super) {
    __extends(GameOverPacket, _super);
    function GameOverPacket(data) {
        var _this = _super.call(this) || this;
        _this.type = PacketType.S_GAME_OVER;
        _this.data = data;
        return _this;
    }
    return GameOverPacket;
}(Packet));
exports.GameOverPacket = GameOverPacket;
var EndGamePacket = /** @class */ (function (_super) {
    __extends(EndGamePacket, _super);
    function EndGamePacket(data) {
        var _this = _super.call(this) || this;
        _this.type = PacketType.S_END_GAME;
        _this.data = data;
        return _this;
    }
    return EndGamePacket;
}(Packet));
exports.EndGamePacket = EndGamePacket;
//# sourceMappingURL=Packets.js.map