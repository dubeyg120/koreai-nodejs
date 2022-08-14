require("dotenv").config({ path: ".env" });

var express = require("express");
const path = require("path");
global.appRoot = path.resolve(__dirname);
var bodyParser = require("body-parser");

var validator = require("express-joi-validator")({
  passError: true, // NOTE: this tells the module to pass the error along for you
});

global._validate = validator;
global._pathconst = require("./api/helpers/constant-data/path-const.js");
var ResHelper = require(_pathconst.FilesPath.ResHelper);
const db = require(_pathconst.FilesPath.Db);

var app = express();
/**
 * Express MiddleWare
 */ //handle multipart requests
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" })); //handle queryStrings
// app.use(bodyParser.json())        //handle json data
app.use(bodyParser.json({ limit: "50mb" }));

(async () => {
  try {
    await db.sequelize.sync();
  } catch (error) {}
})();

app.use(function (req, res, next) {
  // Mentioning content types
  res.setHeader("Content-Type", "application/json; charset=UTF-8");
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Accept,Authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use("/v1", require(_pathconst.FilesPath.Router)); 

app.use((err, req, res, next) => {
  if (err.error.isJoi) {
    let errDetail = [];
    // we had a joi error, let's return a custom 400 json response
    if (err.error.details) {
      err.error.details.map(function (item) {
        var temp = {};
        temp[item.context.key] = item.message;
        errDetail.push(temp);
      });
    }

    ResHelper.apiResponse(
      res,
      false,
      "Submitted Information is not valid.",
      400,
      errDetail,
      ""
    );
  } else {
    ResHelper.apiResponse(res, false, "Error Occured.", 500, {}, "");
  }
});

module.exports = app;
