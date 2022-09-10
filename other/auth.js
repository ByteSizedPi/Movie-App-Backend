const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { serialize } = require("cookie");

//middleware
const generateToken = ({ body: { username } }, res, next) => {
  const token = jwt.sign({ user: username }, "secret");
  const serialized = serialize("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.setHeader("Set-Cookie", serialized);
  res.json({ token: token });
};

const authRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(400).json("authorization header missing");

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secret", (err, authToken) => {
    if (err) return res.status(401).json("not authorized");
    res.authToken = authToken;
    next();
  });
};

const userExists = async (req, res, next) => {
  if (!req.body.username)
    return res.status(400).json("no credentials provided");
  try {
    const results = await User.find({ username: req.body.username });
    if (!results[0]) return res.status(404).json("user not found");
    next();
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
};

module.exports = { userExists, generateToken, authRequest };
