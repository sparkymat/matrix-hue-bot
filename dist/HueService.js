"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var lowdb_1 = __importDefault(require("lowdb"));
var FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
var ServiceState;
(function (ServiceState) {
    ServiceState[ServiceState["Uninitialised"] = 0] = "Uninitialised";
    ServiceState[ServiceState["Unauthenticated"] = 1] = "Unauthenticated";
    ServiceState[ServiceState["Ready"] = 2] = "Ready";
    ServiceState[ServiceState["WaitingForLink"] = 3] = "WaitingForLink";
})(ServiceState = exports.ServiceState || (exports.ServiceState = {}));
var HueService = /** @class */ (function () {
    function HueService(dbPath, hueBaseUrl) {
        this.dbPath = dbPath;
        this.hueBaseUrl = hueBaseUrl;
        this.state = ServiceState.Uninitialised;
        this.hueUsername = "";
        this.bootstrap();
    }
    HueService.prototype.authenticate = function () {
        var _this = this;
        axios_1.default.get(this.hueBaseUrl + "/api/" + this.hueUsername + "/lights").then(function () {
            _this.state = ServiceState.Ready;
        }).catch(function (error) {
            console.log("-------------------");
            console.log(JSON.stringify(error));
            console.log("-------------------");
            if (error.response && error.response.data && error.response.data[0].error.type === 1) {
                _this.registerWithBridge();
            }
        });
    };
    HueService.prototype.bootstrap = function () {
        var adapter = new FileSync_1.default(this.dbPath);
        this.db = lowdb_1.default(adapter);
        this.hueUsername = this.db.get("hueUsername").value() || "huematrixbot";
        this.state = ServiceState.Unauthenticated;
        this.authenticate();
    };
    HueService.prototype.registerWithBridge = function () {
        var _this = this;
        axios_1.default.post(this.hueBaseUrl + "/api", { devicetype: this.hueUsername }).then(function (response) {
            console.log("-------------------");
            console.log(response.data);
            console.log("-------------------");
            _this.hueUsername = response.data[0].success.username;
            _this.db.set("hueUsername", _this.hueUsername);
            _this.state = ServiceState.Ready;
        });
    };
    return HueService;
}());
exports.default = HueService;
//# sourceMappingURL=HueService.js.map