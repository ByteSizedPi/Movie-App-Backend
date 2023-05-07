import { serialize } from "cookie";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
//middleware
const generateToken = (
  { body: { username } }: Request,
  res: Response,
  next?: NextFunction
) => {
  const token = jwt.sign({ user: username }, "secret");
  const serialized = serialize("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.setHeader("Set-Cookie", serialized);
  res.json({ token: token });
};

type AuthResponse = Response & { authToken: any };

const authRequest = (req: Request, res: AuthResponse, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(400).json("authorization header missing");

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secret", (err, authToken) => {
    if (err) return res.status(401).json("not authorized");
    res.authToken = authToken;
    next();
  });
};

const userExists = async (
  { body: { username } }: Request,
  res: Response,
  next: NextFunction
) => {
  if (!username) return res.status(400).json("no credentials provided");
  try {
    const results = await User.find({ username: username });
    if (!results[0]) return res.status(404).json("user not found");
    next();
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
};

export { userExists, generateToken, authRequest };
// export { generateToken, authRequest };
