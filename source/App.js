Pouch.DEBUG = true;
/*
*/

// var remoteDb = "http://localhost:5984/remotedb";
var remoteDb = "http://192.168.169.163:5984/remotedb";
var localDb = "localdb";
// var localDb = remoteDb;

enyo.kind({
  name: "DocList",
  kind: "List",
  onSetupItem: "setupDocItem",
  fit: true,
  components: [
    {name: "docItem", ontap: "docItemTapped"}
  ],
  events: {
    onChooseDocIndex: ""
  },
  docItemTapped: function (inSender, inEvent) {
    console.log("docItemTapped");
    this.doChooseDocIndex(inEvent);
  }
});

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

enyo.kind({
  name: "DocDetails",
  kind: "FittableRows",
  fit: true,
  components:[
    {kind: "enyo.Scroller", fit: true, components: [
      {name: "main", classes: "nice-padding", allowHtml: true}
    ]},
    {kind: "onyx.Toolbar", components: [
      {kind: "onyx.Button", content: "Update", ontap: "helloWorldTap"},
      {kind: "onyx.Input", value: "Content"}
    ]}
  ],

  published: {
    doc: null,
    docId: null,
    db: null
  },

  handlers: {
    onUpdateDocs: "updateDoc",
    onViewDoc: "viewDoc"
  },

  viewDoc: function (inSender, inEvent) {
    this.setDocId(inEvent.doc.id);
    this.$.main.setContent("");
    this.displayDoc(inEvent);
  },

  docIdChanged: function (inOldValue) {
  },

  displayDoc: function(params) {
    if (this.getDocId() !== null) {
      params.db.get(this.getDocId(), { conflicts: true }, enyo.bind(this, function (err, doc) {
        console.log("doc:");
        console.log(doc);
        if (doc._conflicts) {
          // TODO: manage conflicts
          console.log("Conflicts in dbChanges: " + doc._conflicts.length);
          console.log(doc._conflicts);
        } else {
          console.log("dbChanges: no conflict!");
        }
        this.setDoc(doc);
      }));
    }
  },

  updateDoc: function (inSender, inEvent) {

    var that = this;

    console.log("updateDoc called.");

    this.displayDoc(this.getDb(), inEvent.change.id);

  },

  dbChanged: function(inOldValue) {
  },

  docChanged: function (inOldValue) {
    console.log("docChanged:");
    this.$.main.addContent("Updated value: " + this.doc.text + "<br />\n");
    console.log(this.doc);
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
  name: "AppPanels",
  kind: "Panels",
  fit: true,
  components: [
    {kind: DocListPanel},
    {kind: DocDetails}
  ],
  handlers: {
    onDbUpdated: "updateDocs",
    onChooseDocIndex: "viewDoc",
    onDbHandlerChanged: "changeDbHandler"
  },
  
  events: {
    onUpdateDocs: "",
    onViewDoc: ""
  },

  updateDocs: function (inSender, inEvent) {
    console.log("updateDoc called in parent.");
    this.waterfall("onUpdateDocs", inEvent);
  },

  changeDbHandler: function () {
  },

  viewDoc: function (inSender, inEvent) {
    console.log("viewDoc");
    console.log(inEvent.index);
//    inEvent.doc = this.$.docListPanel.getAllDocs()[inEvent.index];
    console.log(inEvent.db);
    this.waterfall("onViewDoc", { doc: this.$.docListPanel.getAllDocs()[inEvent.index], db: this.$.docListPanel.getDb() });
    this.next();
  },

  rendered: function () {

    this.inherited(arguments);
  }
});

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

