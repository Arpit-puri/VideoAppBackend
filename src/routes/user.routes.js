const router = require("express")();
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  updateAccountDetails,
} = require("../controllers/user.controllers");
const { verifyJWT } = require("../middleware/auth");
const upload = require("../middleware/multer");

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

//secure Route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/change-password").patch(verifyJWT, changeCurrentUserPassword);
router.route("/change-credentials").patch(verifyJWT, updateAccountDetails);

module.exports = router;