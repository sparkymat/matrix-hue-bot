"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var matrix_bot_sdk_1 = require("matrix-bot-sdk");
var HueService_1 = __importStar(require("./HueService"));
var OxBot = /** @class */ (function () {
    function OxBot(homeServerUrl, hueServerUrl, accessToken) {
        this.homeServerUrl = homeServerUrl;
        this.hueServerUrl = hueServerUrl;
        this.accessToken = accessToken;
    }
    OxBot.prototype.start = function () {
        var _this = this;
        var storage = new matrix_bot_sdk_1.SimpleFsStorageProvider("huebot.json");
        var hueService = new HueService_1.default("huebot.json", this.hueServerUrl);
        var client = new matrix_bot_sdk_1.MatrixClient(this.homeServerUrl, this.accessToken, storage);
        matrix_bot_sdk_1.AutojoinRoomsMixin.setupOnClient(client);
        client.on("room.message", function (roomId, event) {
            if (!event["content"])
                return;
            if (event["content"]["msgtype"] !== "m.text")
                return;
            //if (event["sender"] === await client.getUserId()) return;
            // Make sure that the event looks like a command we're expecting
            var body = event["content"]["body"];
            if (!body || !body.startsWith("!hue"))
                return;
            if (body === "!hue") {
                _this.respond(client, event, roomId, "Usage: !hue <command> <arg>");
                return;
            }
            //if (!body.startsWith("!hue")) return;
            var commandLine = body.replace(/\!hue\ */, "");
            var command = commandLine.split(" ")[0];
            var args = commandLine.replace(command, "").replace(/\ */, "");
            switch (command) {
                case "status":
                    {
                        if (hueService.state === HueService_1.ServiceState.Ready) {
                            _this.respond(client, event, roomId, "Ready to go!");
                        }
                        else {
                            _this.respond(client, event, roomId, "Not yet authenticated");
                        }
                        break;
                    }
                case "authenticate":
                    {
                        if (hueService.state !== HueService_1.ServiceState.Ready) {
                            hueService.authenticate();
                        }
                        if (hueService.state === HueService_1.ServiceState.Ready) {
                            _this.respond(client, event, roomId, "Ready to go!");
                        }
                        else {
                            _this.respond(client, event, roomId, "Not yet authenticated");
                        }
                        break;
                    }
                default:
                    _this.respond(client, event, roomId, "command: \"" + command + "\" args: \"" + args + "\"");
                    break;
            }
        });
        client.start().then(function () { return console.log("Client started!"); });
    };
    OxBot.prototype.respond = function (client, event, roomId, message) {
        var reply = matrix_bot_sdk_1.RichReply.createFor(roomId, event, message, message);
        reply["msgtype"] = "m.notice";
        client.sendMessage(roomId, reply);
    };
    return OxBot;
}());
exports.default = OxBot;
//# sourceMappingURL=OxBot.js.map