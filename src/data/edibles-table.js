const edibles = require("./edibles").edibles
;(function () {
  //
  // Layout table of edibles as copy-pastable CSV in CLI.
  //
  console.log("Name,Health,Stamina,Hunger,Thirst")
  for (const [itemName, itemDescription] of Object.entries(edibles)) {
    console.log(`${itemName},${itemDescription.onUse[7].join(",")}`)
  }
})()
