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
      // FIXME: not very smart db handling
      if (params.db) {
        this.setDb(params.db);
      }
      this.getDb().get(this.getDocId(), { conflicts: true }, enyo.bind(this, function (err, doc) {
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

