import { Request, Response, Router } from "express";
import { authSession } from "./userAuth";

const router = Router();

router.get("", [authSession], (req: Request, res: Response) => {
  res.json({ validSession: true });
});

export { router as authRouter };
