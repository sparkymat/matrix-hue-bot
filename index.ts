import OxBot from "./OxBot";
require("dotenv").config();

const homeServerUrl = process.env.HOME_SERVER_URL || "";
const hueServerUrl = process.env.HUE_SERVER_URL || "";
const accessToken = process.env.ACCESS_TOKEN || "";

// Now we can create the client and set it up to automatically join rooms.
const bot = new OxBot(homeServerUrl, hueServerUrl, accessToken);
bot.start();
