Pouch.DEBUG = true;
/*
*/

// var remoteDb = "http://localhost:5984/remotedb";
var remoteDb = "http://192.168.169.163:5984/remotedb";
var localDb = "localdb";
// var localDb = remoteDb;

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

