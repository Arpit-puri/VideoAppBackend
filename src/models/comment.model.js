const { Schema, model } = require("mongoose");
const { mongooseAggregatePaginate } = require("mongoose-aggregate-paginate-v2");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
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

commentSchema.plugin(mongooseAggregatePaginate);

const comment = model("Comment", commentSchema);

module.exports = comment;
