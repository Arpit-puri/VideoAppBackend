const multer = require("multer");
  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public/temp"); //callback
  },
  fileName: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    //better way but we dont need for now,For now let us keep it simple
    // cb(null, file.fieldName + "-" + uniqueSuffix);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

module.exports = upload;
