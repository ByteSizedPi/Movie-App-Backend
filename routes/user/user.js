const User = require("../../models/user");

//middleware
const getUserUtility = async (req, res, next, part) => {
  try {
    const results = await User.find({ username: req[part].username });
    res.user = results[0];
    next();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const getUserByParams = async (req, res, next) =>
  getUserUtility(req, res, next, "params");

const getUserByBody = async (req, res, next) =>
  getUserUtility(req, res, next, "body");

const isValidNewUser = (req, res, next) => {
  if (res.user) return res.send({ error: "user already exists" });
  if (!req.body.username || req.body.username.length < 6)
    return res.send({ error: "username must be longer than 6 characters" });
  if (!req.body.password || req.body.password.length < 6)
    return res.send({ error: "password must be longer than 6 characters" });
  next();
};

const userExists = (req, { user }, next) => {
  if (!user) return res.status(404).send({ error: "user does not exist" });
  next();
};

const Try = async (res, callback) => {
  try {
    res.status(200).send(await callback());
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

//route functions
// const getAllUsers = (res) => Try(res, () => User.find({}));

const pushList = (req, res) =>
  Try(res, async () => {
    await User.updateOne({
      username: req.params.username,
      shows_list: [...res.user.shows_list, req.body.show],
    });
    return () => {
      message: "list updated successfully";
    };
  });

module.exports = {
  getUserByParams,
  getUserByBody,
  isValidNewUser,
  userExists,
  pushList,
};

// import { Router } from "express";
// const router = Router();
// import { User } from "../api/models/user";
// const User = require("../api/models/user");
// const { getUserByBody, getUserByParams } = require("../api/Utils");
// const listRouter = require("../api/routes/list");
// router.use("/list", listRouter);

/* get methods */

//get all users
// router.get("/all", (req, res) => {
//   User.find({})
//     .then((allUsers) => res.send(allUsers))
//     .catch((err) => res.status(500).send({ error: err.message }));
// });

//test if username exists
// router.get("/username=:username", getUserByParams, (req, res) =>
//   res.send({ username: req.params.username, userExists: !!res.user })
// );

/* post methods */

//create new user
// router.post("/new", [getUserByBody, isValidNewUser], async (req, res) => {
//   new User(req.body)
//     .save()
//     .then((_) => res.status(201).send({ message: "user created successfully" }))
//     .catch((err) => res.status(400).send({ error: err.message }));
// });

// router.post("/", getUserByBody, (req, res) => {
//   try {
//     if (res.user && res.user.password === req.body.password)
//       res.send({ token: "#1542" });
//     else res.send({ error: "user does not exist" });
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// });
