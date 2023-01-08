import { Router } from "express";
import User from "../../models/User";
import { authRequest } from "../../other/auth";
const router = Router();

export { router as userRouter };
