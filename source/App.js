Pouch.DEBUG = true;
/*
*/

// var remoteDb = "http://localhost:5984/remotedb";
var remoteDb = "http://localhost:5984/remotedb";
var localDb = "localdb";
// var localDb = remoteDb;

//Pouch.replicate("http://192.168.169.163:5984/remotedb", "localdb", {




enyo.kind({
  name: "App",
  kind: "FittableRows",
  fit: true,
  components:[
    {kind: "Signals", ondeviceready: "deviceReady"},
    {kind: "onyx.Toolbar", content: "Hello World"},
    {kind: "enyo.Scroller", fit: true, components: [
      {name: "main", classes: "nice-padding", allowHtml: true}
    ]},
    {kind: "onyx.Toolbar", components: [
      {kind: "onyx.Button", content: "Update", ontap: "helloWorldTap"},
      {kind: "onyx.Input", value: "Content"}
    ]}
  ],

  deviceReady: function() {
    // respond to deviceready event
  },

  published: {
    db: null,
    dbChanges: null,
    doc: null
  },

  dbChanged: function(inOldValue) {
  },

  docChanged: function (inOldValue) {
    console.log("docChanged:");
    this.$.main.addContent("Updated value: " + this.doc.text + "<br />\n");
    console.log(this.doc);
    //    this.$.input.setValue(this.doc.text);
  },

  create: function () {

    console.log("App.onCreate called!");

    var that = this;

    this.inherited(arguments);

    Pouch.destroy("localdb", function() { 
      console.log("Database destroyed.");
      that.setDb(Pouch(localDb, function (err, db) {
        console.log(" *** FIXME: This callback is called several times in cordova/android. *** ");
        if (err) {
          console.log("error creating database:");
          console.log(err);
        } else {
          console.log(" Database created ");
          if (that.getDbChanges() === null) {
            console.log("Registering to changes.");
            that.setDbChanges(that.db.changes({
              continuous: true,
              onChange: function(change) {

                console.log("db onChange:");
                console.log(change);

                that.db.get(change.id, { conflicts: true }, function (err, doc) {
                  console.log("doc:");
                  console.log(doc);
                  if (doc._conflicts) {
                    console.log("Conflicts in dbChanges: " + doc._conflicts.length);
                    console.log(doc._conflicts);
                  } else {
                    console.log("dbChanges: no conflict!");
                  }
                  that.setDoc(doc);
                });
              }
            }));

            console.log("Starting continuous replication from remote to local.");

            Pouch.replicate(remoteDb, localDb, {
              continuous : true,
              onChange: function (changes) {
                if (err) {
                  console.log("replicate(remote, local): err sync:");
                  console.log(err);
                } else {
                  console.log("replicate(remote, local): changes:");
                  console.log(changes);
                }
              }
            });
          }
        }
      }
             )
      );
    });
  },

  rendered: function () {

    this.inherited(arguments);

  },

  helloWorldTap: function(inSender, inEvent) {
    var that = this;
    this.getDb().put({
      _id: 'test',
      _rev: this.getDoc()._rev,
      text: that.$.input.getValue()
    },
    function (err, response) {
      if (err) {
        console.log("error put:");
        console.log(err);
      } else {
        console.log("Replicating recent changes.");
        Pouch.replicate(localDb, remoteDb, {
          continuous : false,
          onChange: function(changes) {
            if (err) {
              console.log("replicate(local, remote): err sync:");
              console.log(err);
            } else {
              console.log("replicate(local, remote): changes:");
              console.log(changes);
            }
          } 
        });
      }
      console.log(response);
    });
  }
});

