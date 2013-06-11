
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
