const dotEnvConfig = require("dotenv").config;
const mongoose = require("mongoose");

const setHeaders = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
};

const config = () => {
  dotEnvConfig();

  mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("connected to database"));
};

module.exports = { config, setHeaders };
