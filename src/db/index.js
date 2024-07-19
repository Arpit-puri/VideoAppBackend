const mongoose = require("mongoose");
const { DB_NAME } = require("../constant");

exports.connectDB = (async () => {
  try {
    const connnectionInstance = await mongoose.connect(
      `${process.env.MongooURL}/${DB_NAME}`,
    );
    // console.log(connnectionInstance);
    //connnectionInstance.connection.host to know where is the db connected
    console.log(`DB is connected!!! ${connnectionInstance.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to mongooDB`);
    process.exit(1);
  }
})();
/*(async()=>{})() by this way in js we can execute the function without going in another line and
calling it again like connnectDB()*/
