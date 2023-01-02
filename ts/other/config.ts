import { config as dotEnvConfig } from "dotenv";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
}

function setHeaders(req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
}

function config() {
  dotEnvConfig();
  mongoose.connect(process.env.DATABASE_URL);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("connected to database"));
}

export { config, setHeaders };
