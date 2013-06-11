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

