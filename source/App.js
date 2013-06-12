Pouch.DEBUG = true;
/*
*/

// var remoteDb = "http://localhost:5984/remotedb";
var DSN = function (inOptions) {

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

var remoteDb = DSN({
    protocol    : "http",
    serverName  : "192.168.169.163",
    port        : 5984,
    dbName      : "remotedb",
    login       : "",
    passwd      : ""
});

var localDb = DSN({
  dbName: "localdb"
});

console.log("remoteDb: " + remoteDb);
console.log("localDb: " + localDb);

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

