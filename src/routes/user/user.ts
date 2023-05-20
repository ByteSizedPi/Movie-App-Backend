import { NextFunction, Request, Response } from "express";
import User from "../../models/User";

//middleware
const getUserUtility = async (
  req: Request,
  res: Response<{ user: string }>,
  next: NextFunction,
  part: string
) => {
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
  // if (res.user) return res.send({ error: "user already exists" });
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
