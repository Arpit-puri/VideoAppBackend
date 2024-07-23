const router = require("express")();
const { registerUser, loginUser, logoutUser } = require("../controllers/user.controllers");
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
router.route('logout').post(verifyJWT,logoutUser)

module.exports = router;
