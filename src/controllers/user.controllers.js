const { asyncHandler } = require("../utils/asyncHandler");
const ApiError = require("../utils/apirError");
const { User } = require("../models/user.model");
const uploadCloudinary = require("../utils/Cloudinary");
const apiResonse = require("../utils/apiresponse");

const generateAccessTokenandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log(refreshToken);
    user.refreshToken = refreshToken;
    await user.save({ ValidityState: false });
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
  console.log(req.body);
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

  return res(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new apiResonse(200, {}, "Logout successfull"));
});
