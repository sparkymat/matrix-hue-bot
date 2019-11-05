import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  RichReply,
} from "matrix-bot-sdk";
import axios from "axios";
import lowdb from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
require("dotenv").config();

const homeserverUrl = process.env.HOME_SERVER_URL || "";
const accessToken = process.env.ACCESS_TOKEN || "";
const storage = new SimpleFsStorageProvider("huebot.json");
const adapter = new FileSync("huebot.json");
const db = lowdb(adapter);

// Now we can create the client and set it up to automatically join rooms.
const client = new MatrixClient(homeserverUrl, accessToken, storage);
AutojoinRoomsMixin.setupOnClient(client);

client.on("room.message", handleCommand);
client.start().then(() => console.log("Client started!"));

function respond(client: any, event: any, roomId: string, message: string) {
  const reply = RichReply.createFor(roomId, event, message, message);
  reply["msgtype"] = "m.notice";
  client.sendMessage(roomId, reply);
}

async function handleCommand(roomId: string, event: any) {
  if (!event["content"]) return;
  if (event["content"]["msgtype"] !== "m.text") return;
  if (event["sender"] === await client.getUserId()) return;

  // Make sure that the event looks like a command we're expecting
  const body = event["content"]["body"];
  if (!body || !body.startsWith("!hue")) return;

  if (body === "!hue") {
    respond(client, event, roomId, "Usage: !hue <command> <arg>");
    return;
  }

  //if (!body.startsWith("!hue")) return;

  const commandLine = body.replace(/\!hue\ */, "");
  const command = commandLine.split(" ")[0];
  const args = commandLine.replace(command, "").replace(/\ */, "");
  const username = db.get("hueUsername").value() || "huematrixbot";

  switch (command) {
    case "status":
      {
        const postData = {
          devicetype: username
        };

        axios.post("http://192.168.0.2/api/", postData).then(response => {
          respond(client, event, roomId, JSON.stringify(response.data));
        }).catch(error => {
          respond(client, event, roomId, error)
        });
        break;
      }
    default:
      respond(client, event, roomId, `command: "${command}" args: "${args}"`);
      break;
  }
}
