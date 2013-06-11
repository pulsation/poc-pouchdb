Pouch.DEBUG = true;
/*
*/

// var remoteDb = "http://localhost:5984/remotedb";
var remoteDb = "http://192.168.169.163:5984/remotedb";
var localDb = "localdb";
// var localDb = remoteDb;

enyo.kind({
  name: "App",
  fit: true,
  kind: "FittableRows",
  components: [
    {kind: "Signals", ondeviceready: "deviceReady"},
    {kind: "onyx.Toolbar", content: "Hello World"},
    {kind: "AppPanels", fit: true}
  ],
  deviceReady: function() {
    // respond to deviceready event
  } 
});

