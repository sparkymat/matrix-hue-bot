"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var OxBot_1 = __importDefault(require("./OxBot"));
require("dotenv").config();
var homeServerUrl = process.env.HOME_SERVER_URL || "";
var hueServerUrl = process.env.HUE_SERVER_URL || "";
var accessToken = process.env.ACCESS_TOKEN || "";
// Now we can create the client and set it up to automatically join rooms.
var bot = new OxBot_1.default(homeServerUrl, hueServerUrl, accessToken);
bot.start();
//# sourceMappingURL=index.js.map