var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

var indexRouter = require("./routes/index");

var app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 3 requests per windowMs
});
app.use(limiter);

app.use(
  cors({
    origin: ["https://www.agencyhandy.com", "https://agencyhandy.com"],
    methods: "POST, OPTIONS",
    optionsSuccessStatus: 200,
    // origin:true
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/free-tools-server-express-test/", indexRouter);
app.use("/", (req, res) => res.sendStatus(200));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return res.sendStatus(404);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.json({
    message: err.message,
  });
});

app.listen(3000, () => {
  console.log(`App listening on port ${3000}`);
});

module.exports = app;
