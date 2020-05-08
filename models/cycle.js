var mongoose = require("mongoose");

var cycleSchema = new mongoose.Schema({
    brand: String,
    model: String,
    date: String,
    city: String,
    state: String,
    phone: String,
    mail: String,
    war: String,
    descrip: String,
    image: String,
    author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
    
});

module.exports = mongoose.model("Cycle",cycleSchema);
