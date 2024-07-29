const { asyncHandler } = require("../utils/asyncHandler");
const { mongoose } = require("mongoose");
const ApiError = require("../utils/apirError");
const { User } = require("../models/user.model");
const uploadCloudinary = require("../utils/Cloudinary");
const apiResonse = require("../utils/apiresponse");
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/apiresponse");

const generateAccessTokenandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wromg while generating user");
  }
};

exports.registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, userName, password } = req.body;
  //instead of map we will use some to check if any field is empty or all are having data
  if (
    [email, fullName, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields required.");
  }

  //check if user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = await req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = await req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image required");
  }

  const avatarr = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatarr) {
    throw new ApiError(400, "Avatar Image required to upload");
  }

  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatarr.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  //it will remove password and refresh token from findbyid to be saved in created user
  if (!createdUser) {
    throw new ApiError(400, "Cannot create user");
  }

  return res
    .status(201)
    .json(new apiResonse(200, createdUser, "User Registered successfully"));
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "Username or Email is required.");
  }
  if (!password) {
    throw new ApiError(400, "Password is required.");
  }

  const userExist = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!userExist) {
    throw new ApiError(404, "User does not exist");
  }

  const passwordCheck = await userExist.isPasswordCorrect(password);

  if (!passwordCheck) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenandRefreshTokens(userExist._id);

  const loggedUser = await User.findById(userExist._id).select(
    "-password -refreshToken",
  );

  //so cookie cant be set from front end only server can do it
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResonse(
        200,
        {
          user: loggedUser,
          accessToken, //shd not be send
          refreshToken,
        },
        "User Logged in successfully",
      ),
    );
});

exports.logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );
  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new apiResonse(200, {}, "Logout successfull"));
});

exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  const decodedToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedToken?.id);
  if (!user) {
    throw new ApiError(401, "Invalid Token");
  }

  if (refreshToken !== user.refreshToken) {
    throw new ApiError(401, "Token expired or used");
  }
  //can be declared globally due to multiple use
  const option = {
    httpOnly: true,
    secure: true,
  };

  const Token = await generateAccessTokenandRefreshTokens(user._id);
  return res
    .status(200)
    .cookie("accessToken", Token.accessToken, option)
    .cookie("refreshToken", Token.refreshToken, option)
    .json(
      new ApiResponse(200, {
        accessToken: Token.accessToken,
        refreshToken: Token.refreshToken,
      }),
    );
});

exports.changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "Please fill all the fields");
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password does not match");
  }

  const user = await User.findById(req.user?._id);

  const passwordCheck = await user.isPasswordCorrect(oldPassword);
  if (!passwordCheck) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully"));
});

exports.updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName && email)) {
    throw new ApiError(400, "Please fill all the fields");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullName, email } },
    { new: true },
  ).select("-password -avatar -coverImage -refreshToken");
  return res
    .status(200)
    .json(new apiResonse(200, user, "Account updated Successfully"));
});

exports.updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image not found");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Avatar image error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Image updated successfully"));
});

exports.updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = await req.files?.coverImage?.[0]?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover Image not found");
  }

  const coverImage = await uploadCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "cover Image error while uploading avatar");
  }

  // const oldCoverImage = await User.findById(req.user?._id);
  // console.log(oldCoverImage.coverImage);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: coverImage.url,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Image updated successfully"));
});

exports.getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.query;

  if (!userName?.trim()) {
    throw new ApiError(400, "User Name is Missing");
  }
  // User.find({userName}) instead of doing this we will use aggrigation pipline

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscriberCount: 1,
        channelsubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  // console.log(channel);
  if (!channel?.length) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel, "Details send successfully"));
});
