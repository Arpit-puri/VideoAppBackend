const { multer } = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");//callback
  },
  fileName: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldName + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
