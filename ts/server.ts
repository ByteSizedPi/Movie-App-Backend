import express, { Express } from "express";
import { setHeaders } from "./other/config";
import { moviesRouter } from "./routes/external/moviesRouter";
import { userRouter } from "./routes/user/userRouter";
import { userExists, generateToken } from "./other/auth";

const app: Express = express();
app.use([express.json(), setHeaders]);

app.post("/login", [userExists, generateToken]);

app.use("/movies", moviesRouter);
app.use("/user", userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server started on localhost:${port}`));
