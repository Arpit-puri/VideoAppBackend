const { asyncHandler } = require("../utils/asyncHandler");
const ApiError = require("../utils/apirError");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

exports.verifyJWT = asyncHandler(async (req,_,next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(402, "Unauthorized Request");
    }
    const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //check in userModel from line 70 jwt.sign id toknw why used decodeInfo.id not _id
    const user = await User.findById(decodedInfo?.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(402, "invalid Request");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "invalid Token");
  }
});
