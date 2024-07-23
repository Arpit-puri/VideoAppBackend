const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.routes");
const helmet = require("helmet"); //secure header http
const mongosanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

/**Data sanitization against NOSQL query injection */
app.use(mongosanitize());

/**Data sanitization against xss attack */
app.use(xss());

/**secure header http */
app.use(helmet());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json({ limit: "16kb" })); //define limit according to your server power

//to keep any file on your server in this case in public folder we use
app.use(express.static("public"));

// Enable CORS
app.use(
  cors({
    origin: process.env.cors_origin,
    credentials: true,
  }),
);
/** Change your origin according to front end hosted
 */

//use to prevent x header attack
app.disable("x-powered-by");

//Parsing cookies
app.use(cookieParser());


//Router declaration
app.use("/users", userRouter);

module.exports={app};
