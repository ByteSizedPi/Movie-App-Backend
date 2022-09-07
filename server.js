//SCM_DO_BUILD_DURING_DEPLOYMENT
// true

const { config, setHeaders } = require("./other/config");
const { userExists, generateToken, authRequest } = require("./other/auth");

const express = require("express");
const app = express();
config();

app.use([express.json(), setHeaders]);

const moviesRouter = require("./routes/external/moviesRouter");
const torrentRouter = require("./routes/torrents/streamRouter");
const userRouter = require("./routes/user/userRouter");

app.post("/login", [userExists, generateToken]);

app.use("/movies", moviesRouter);
app.use("/stream", torrentRouter);
app.use("/user", userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server started on localhost:${port}`));
