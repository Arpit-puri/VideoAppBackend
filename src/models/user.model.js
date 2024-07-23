const { mongoose, Schema } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userShema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true, //help in searching but make db heavy if used too much
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, //Cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

//avoid using arrow functiona s .this method cannot be used with it
userShema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    /**this.isModified is inbuild function that will insure that
     * this pre hook will not run password is not changed */
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userShema.methods.isPasswordCorrect = async function (password) {
  // console.log(password);
  return await bcrypt.compare(password, this.password);
};

userShema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email, userName: this.userName },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
  return token;
};
userShema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

exports.User = mongoose.model("User", userShema);
