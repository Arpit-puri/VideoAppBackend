// require("dotenv").config({path:'./env'});
const dotenv = require("dotenv");
const { app } = require("./app");

dotenv.config();

//connect Database
require("./db/index");

const port = process.env.PORT || 2000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
