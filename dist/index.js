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
var matrix_bot_sdk_1 = require("matrix-bot-sdk");
var axios_1 = __importDefault(require("axios"));
var lowdb_1 = __importDefault(require("lowdb"));
var FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
require("dotenv").config();
var homeserverUrl = process.env.HOME_SERVER_URL || "";
var accessToken = process.env.ACCESS_TOKEN || "";
var storage = new matrix_bot_sdk_1.SimpleFsStorageProvider("oxbot.json");
var adapter = new FileSync_1.default("oxbot.json");
var db = lowdb_1.default(adapter);
// Now we can create the client and set it up to automatically join rooms.
var client = new matrix_bot_sdk_1.MatrixClient(homeserverUrl, accessToken, storage);
matrix_bot_sdk_1.AutojoinRoomsMixin.setupOnClient(client);
client.on("room.message", handleCommand);
client.start().then(function () { return console.log("Client started!"); });
function respond(client, event, roomId, message) {
    var reply = matrix_bot_sdk_1.RichReply.createFor(roomId, event, message, message);
    reply["msgtype"] = "m.notice";
    client.sendMessage(roomId, reply);
}
function handleCommand(roomId, event) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, body, commandLine, command, args, username, postData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!event["content"])
                        return [2 /*return*/];
                    if (event["content"]["msgtype"] !== "m.text")
                        return [2 /*return*/];
                    _a = event["sender"];
                    return [4 /*yield*/, client.getUserId()];
                case 1:
                    if (_a === (_b.sent()))
                        return [2 /*return*/];
                    body = event["content"]["body"];
                    if (!body || !body.startsWith("!hue"))
                        return [2 /*return*/];
                    if (body === "!hue") {
                        respond(client, event, roomId, "Usage: !hue <command> <arg>");
                        return [2 /*return*/];
                    }
                    commandLine = body.replace(/\!hue\ */, "");
                    command = commandLine.split(" ")[0];
                    args = commandLine.replace(command, "").replace(/\ */, "");
                    username = db.get("hueUsername").value() || "oxmatrixbot";
                    switch (command) {
                        case "status":
                            {
                                postData = {
                                    devicetype: username
                                };
                                axios_1.default.post("http://192.168.0.2/api/", postData).then(function (response) {
                                    respond(client, event, roomId, JSON.stringify(response.data));
                                }).catch(function (error) {
                                    respond(client, event, roomId, error);
                                });
                                break;
                            }
                        default:
                            respond(client, event, roomId, "command: \"" + command + "\" args: \"" + args + "\"");
                            break;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=index.js.map