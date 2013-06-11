enyo.kind({
  name: "DocListPanel",
  
  components: [
    {kind: DocList}
  ],

  published: {
    db: null,
    dbChanges: null,
    allDocs: null
  },

  events: {
    onDbUpdated: "",
    onDbHandlerChanged: ""
  },

  handlers: {
    onUpdateDocs: "updateAllDocs"
  },

  updateAllDocs: function (inSender, inEvent) {
    console.log("updateAllDocs called.");

    inEvent.db.allDocs({}, enyo.bind(this, function (err, response) {
      console.log("allDocsResponse:");
      console.log(response);
      this.setAllDocs(response.rows);
    }));
  },

  allDocsChanged: function (inOldValue) {
    console.log("setAllDocs called.");
    this.$.docList.setCount(this.allDocs.length);
    this.$.docList.refresh();
  },

  setupDocItem: function (inSender, inEvent) {
    var docId = this.getAllDocs()[inEvent.index].id;

    console.log("setupDocItem called.");
    console.log(inEvent);

    this.$.docList.$.docItem.setContent(docId);
  },

  dbChanged: function(inOldValue) {
    
    this.doDbHandlerChanged(this.getDb());

    // Launching replication.
    if (this.getDbChanges() === null) {
      console.log("Registering to changes.");
      this.setDbChanges(this.getDb().changes({
        continuous: true,
        onChange: enyo.bind(this, function(change) {

          console.log("db onChange:");
          console.log(change);
          
          this.doDbUpdated({ db: this.getDb(), change: change });

        })
      }));

      console.log("Starting continuous replication from remote to local.");

      Pouch.replicate(remoteDb, localDb, {
        continuous : true,
        onChange: function (changes) {
          console.log("replicate(remote -> local): changes:");
          console.log(changes);
        }
      },
      function (err, response) {
        if (err) {
          console.log("Replicate remote -> local: Error: ");
          console.log(err);
          if ((err.status === 401) && (err.error === "unauthorized")) {
            console.log("TOD: authentication");
          }
        }
        console.log("Replicate remote -> local: Response:");
        console.log(response);
      });
    }
  },

  create: function () {

    this.inherited(arguments);

    Pouch.destroy(localDb, enyo.bind(this, function() { 
      console.log("Database destroyed.");

      Pouch(localDb, enyo.bind(this, function (err, db) {
        console.log(" *** FIXME: This callback is called several times in cordova/android. *** ");
        if (err) {
          console.log("error creating database:");
          console.log(err);
        } else {
          this.setDb(db);
          console.log(" Database created ");
        }
      }));
    }));
  }
});
