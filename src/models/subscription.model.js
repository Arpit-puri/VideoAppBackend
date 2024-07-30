const { Schema, model } = require("mongoose");

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  channel:{
    type: Schema.Types.ObjectId,
    ref: "User"
  }
},{
    timestamps: true
});

module.exports.Subscription = model("Subscription", subscriptionSchema);
