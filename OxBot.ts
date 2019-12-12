import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  RichReply,
} from "matrix-bot-sdk";
import HueService, { ServiceState } from "./HueService";

class OxBot {
  private homeServerUrl: string;
  private hueServerUrl:  string;
  private accessToken:   string;

  constructor(homeServerUrl: string, hueServerUrl: string, accessToken: string) {
    this.homeServerUrl = homeServerUrl;
    this.hueServerUrl  = hueServerUrl;
    this.accessToken   = accessToken;
  }

  public start() {
    const storage = new SimpleFsStorageProvider("huebot.json");
    const hueService = new HueService("huebot.json", this.hueServerUrl);

    const client = new MatrixClient(this.homeServerUrl, this.accessToken, storage);
    AutojoinRoomsMixin.setupOnClient(client);

    client.on("room.message", (roomId: string, event: any) => {
      if (!event["content"]) return;
      if (event["content"]["msgtype"] !== "m.text") return;
      //if (event["sender"] === await client.getUserId()) return;

      // Make sure that the event looks like a command we're expecting
      const body = event["content"]["body"];
      if (!body || !body.startsWith("!hue")) return;

      if (body === "!hue") {
        this.respond(client, event, roomId, "Usage: !hue <command> <arg>");
        return;
      }

      //if (!body.startsWith("!hue")) return;

      const commandLine = body.replace(/\!hue\ */, "");
      const command = commandLine.split(" ")[0];
      const args = commandLine.replace(command, "").replace(/\ */, "");

      switch (command) {
        case "status":
          {
            if (hueService.state === ServiceState.Ready) {
              this.respond(client, event, roomId, "Ready to go!");
            } else {
              this.respond(client, event, roomId, "Not yet authenticated");
            }
            break;
          }
        case "authenticate":
          {
            if (hueService.state !== ServiceState.Ready) {
              hueService.authenticate();
            }

            if (hueService.state === ServiceState.Ready) {
              this.respond(client, event, roomId, "Ready to go!");
            } else {
              this.respond(client, event, roomId, "Not yet authenticated");
            }
            break;
          }
        default:
          this.respond(client, event, roomId, `command: "${command}" args: "${args}"`);
          break;
      }
    });
    client.start().then(() => console.log("Client started!"));
  }

  private respond(client: any, event: any, roomId: string, message: string) {
    const reply = RichReply.createFor(roomId, event, message, message);
    reply["msgtype"] = "m.notice";
    client.sendMessage(roomId, reply);
  }
}

export default OxBot;
