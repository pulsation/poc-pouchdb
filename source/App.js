Pouch.DEBUG = true;

var acacia = window.acacia || {};

// var remoteDb = "http://localhost:5984/remotedb";
acacia.DBManager = function (inOptions) {

  return enyo.mixin({
    protocol    : "",
    serverName  : "",
    port        : -1,
    dbName      : "",
    login       : "",
    passwd      : "",

    get url () {
      return (this.protocol !== "" ? this.protocol + "://" : "") +
        (this.login !== "" ? this.login + ":" + this.passwd + "@" : "") +
        this.serverName + 
        (this.port > 0 ? ":" + this.port.toString() + "/" : "") + 
        this.dbName;
    },

    toString: function () {
      return this.url;
    }

  }, inOptions);
};

acacia.remoteDb = acacia.DBManager({
    protocol    : "http",
    serverName  : "192.168.169.163",
    port        : 5984,
    dbName      : "remotedb",
    login       : "",
    passwd      : ""
});

acacia.localDb = acacia.DBManager({
  dbName: "localdb"
});

enyo.kind({
  name: "LoginToolbar",
  kind: "onyx.Toolbar",
  components: [
    {kind: "onyx.InputDecorator", components: [
      { kind: "onyx.Input", placeholder: "login" }
    ]},
    {kind: "onyx.InputDecorator", components: [
      { kind: "onyx.Input", placeholder: "password" },
    ]},
    { kind: "onyx.Button", content: "Log in" }
  ]
});

enyo.kind({
  name: "App",
  fit: true,
  kind: "FittableRows",
  components: [
    {kind: "Signals", ondeviceready: "deviceReady"},
    {kind: "LoginToolbar", content: "Hello World"},
    {kind: "AppPanels", fit: true}
  ],
  deviceReady: function() {
    // respond to deviceready event
  } 
});

