import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import User from "../../models/User";
import {
  authSession,
  generateToken,
  usernameExists,
  verifyPassword,
} from "../auth/userAuth";

const router = Router();

router.post("/register", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send({ error: "user already exists" });

  try {
    const { username, password, email, firstName, lastName } = req.body;
    const validUser = username && password && email && firstName && lastName;
    if (!validUser) return res.status(400).send({ error: "missing fields" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
    });
    res.status(201).send({ message: "user created successfully" });
  } catch ({ message }) {
    res.status(500).send({ error: message });
  }
});

router.get("/verifyUsername/:username", async (req, res) => {
  const username = req.params.username;
  if (!username) return res.status(400).json("No credentials provided");

  const results = await User.findOne({ username });
  return res.status(200).json({ username: results ? results.username : null });
});

router.post("/login", [usernameExists, verifyPassword, generateToken]);

router.get("/list", [authSession], async (req: Request, res: Response) => {
  const { id } = req.user;
  const userList = await User.findOne({ _id: id }, { shows_list: 1 });
  console.log(userList);
});

router.get("/hello", [authSession], (req: Request, res: Response) =>
  res.json({ message: "hello" })
);
export { router as userRouter };
