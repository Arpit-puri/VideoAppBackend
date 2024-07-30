const { Schema, model } = require("mongoose");

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  },
);

const Tweet = model("Tweet", tweetSchema);

module.exports = Tweet;
