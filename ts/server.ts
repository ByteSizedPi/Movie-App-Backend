import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import { appConfig } from "./other/config";
import { authRouter } from "./routes/auth/authRouter";
import { moviesRouter } from "./routes/external/moviesRouter";
import { userRouter } from "./routes/user/userRouter";
appConfig();
const app: Express = express();

app.use([
  express.json(),
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  }),
  cookieParser(),
]);

app.use("/auth", authRouter);
app.use("/movies", moviesRouter);
app.use("/user", userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server started on localhost:${port}`));
