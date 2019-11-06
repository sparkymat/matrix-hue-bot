import axios from "axios";
import lowdb from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

export enum ServiceState {
  Uninitialised,
  Unauthenticated,
  Ready,
  WaitingForLink,
}

class HueService {
  private dbPath:      string;
  private hueBaseUrl:  string;
  private db:          any;
  private hueUsername: string;

  public state: ServiceState;

  constructor(dbPath: string, hueBaseUrl: string) {
    this.dbPath      = dbPath;
    this.hueBaseUrl  = hueBaseUrl;
    this.state       = ServiceState.Uninitialised;
    this.hueUsername = "";

    this.bootstrap();
  }

  public authenticate() {
    axios.get(`/api/${this.hueUsername}/lights`).then(() => {
      this.state = ServiceState.Ready;
    }).catch(error => {
      if (error.response && error.response.data && error.response.data[0].error.type === 1) {
        this.registerWithBridge()
      }
    });
  }

  private bootstrap() {
    const adapter = new FileSync(this.dbPath);
    this.db = lowdb(adapter);
    this.hueUsername = this.db.get("hueUsername").value() || "huematrixbot";

    this.state = ServiceState.Unauthenticated;

    this.authenticate();
  }

  private registerWithBridge() {
    axios.post("/api", {devicetype: this.hueUsername}).then(response => {
      this.hueUsername = response.data[0].success.username;
      this.db.set("hueUsername", this.hueUsername);
      this.state = ServiceState.Ready;
    });
  }
}

export default HueService;
