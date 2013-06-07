Pouch.DEBUG = true;
/*
*/

// var remoteDb = "http://localhost:5984/remotedb";
var remoteDb = "http://192.168.169.163:5984/remotedb";
var localDb = "localdb";
// var localDb = remoteDb;

//Pouch.replicate("http://192.168.169.163:5984/remotedb", "localdb", {

enyo.kind({
  name: "DocList",
  
  published: {
    db: null,
    dbChanges: null
  },

  events: {
    onDbUpdated: ""
  },

  dbChanged: function(inOldValue) {

    var that = this;

    // Launching replication.
    if (that.getDbChanges() === null) {
      console.log("Registering to changes.");
      that.setDbChanges(that.getDb().changes({
        continuous: true,
        onChange: function(change) {

          console.log("db onChange:");
          console.log(change);
          
          that.doDbUpdated({ db: that.getDb(), change: change });

        }
      }));

      console.log("Starting continuous replication from remote to local.");

      Pouch.replicate(remoteDb, localDb, {
        continuous : true,
        onChange: function (changes) {
/*          if (err) {
            console.log("replicate(remote -> local): err sync:");
            console.log(err);
          } else {*/
            console.log("replicate(remote -> local): changes:");
            console.log(changes);
//          }
        }
      },
      function (err, response) {
        if (err) {
          // TODO: authentication
          console.log("Replicate remote -> local: Error: ");
          console.log(err);
        }
        console.log("Replicate remote -> local: Response:");
        console.log(response);
      });
    }
  },

  create: function () {
    var that = this;

    this.inherited(arguments);

    Pouch.destroy(localDb, function() { 
      console.log("Database destroyed.");

      Pouch(localDb, function (err, db) {
        console.log(" *** FIXME: This callback is called several times in cordova/android. *** ");
        if (err) {
          console.log("error creating database:");
          console.log(err);
        } else {
          that.setDb(db);
          console.log(" Database created ");
        }
      });
    });
  }
});

enyo.kind({
  name: "DocDetails",
  kind: "FittableRows",
  fit: true,
  components:[
    {kind: "onyx.Toolbar", content: "Hello World"},
    {kind: "enyo.Scroller", fit: true, components: [
      {name: "main", classes: "nice-padding", allowHtml: true}
    ]},
    {kind: "onyx.Toolbar", components: [
      {kind: "onyx.Button", content: "Update", ontap: "helloWorldTap"},
      {kind: "onyx.Input", value: "Content"}
    ]}
  ],

  published: {
    doc: null
  },

  handlers: {
    onUpdateDocs: "updateDoc"
  },

  updateDoc: function (inSender, inEvent) {

    var that = this;

    console.log("updateDoc called.");

    inEvent.db.get(inEvent.change.id, { conflicts: true }, function (err, doc) {
      console.log("doc:");
      console.log(doc);
      if (doc._conflicts) {
        // TODO: manage conflicts
        console.log("Conflicts in dbChanges: " + doc._conflicts.length);
        console.log(doc._conflicts);
      } else {
        console.log("dbChanges: no conflict!");
      }
      that.setDoc(doc);
    });
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

//    });
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
              console.log("Replicate(local -> remote): err sync:");
              console.log(err);
            } else {
              console.log("Replicate(local -> remote): changes:");
              console.log(changes);
            }
          } 
        },
        function (err, response) {
          if (err) {
            // TODO: authentication
            console.log("Replicate(local -> remote): Error: ");
            console.log(err);
          }
          console.log("Replicate (local -> remote): Response:");
          console.log(response);
        });
      }
      console.log(response);
    });
  }
});

enyo.kind({
  name: "App",
  fit: true,
  kind: "Panels",
  components: [
    {kind: "Signals", ondeviceready: "deviceReady"},
    {kind: DocList},
    {kind: DocDetails}
  ],
  deviceReady: function() {
    // respond to deviceready event
  }, 

  handlers: {
    onDbUpdated: "updateDocs"
  },
  
  events: {
    onUpdateDocs: ""
  },

  updateDocs: function (inSender, inEvent) {
    console.log("updateDoc called in parent.");
    this.waterfall("onUpdateDocs", inEvent);
  },

  rendered: function () {

    this.inherited(arguments);
    
    // FIXME: Temporary, as getting all docs is not yet implemented.
    this.next();
  },
});

/*
        db.allDocs({}, function (err, response) {
          console.log("allDocsResponse:");
          console.log(response);
        });
      });
      */
