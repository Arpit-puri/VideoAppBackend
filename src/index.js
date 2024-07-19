// require("dotenv").config({path:'./env'});
const dotenv = require("dotenv");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

//connect Database
require("./db/index");

const port = process.env.PORT || 2000;

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

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
