const { mongoose, Schema, Types } = require("mongoose");
const { mongooseAggregatePaginate } = require("mongoose-aggregate-paginate-v2");
const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, //will be taking from cloudnary url
      required: true,
    },
    thumbNail: {
      type: String,
      required: true,
    },
    desciption: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, //from cloudnary
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean, //will help if in future user wants to hide it
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

videoSchema.plugin(mongooseAggregatePaginate);

exports.Video = mongoose.model("Video", videoSchema);
