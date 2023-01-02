import { config, setHeaders } from "./other/config";
config();
import express, { Express } from "express";
import { moviesRouter } from "./routes/external/moviesRouter";

const app: Express = express();
app.use([express.json(), setHeaders]);
app.use("/movies", moviesRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server started on localhost:${port}`));
