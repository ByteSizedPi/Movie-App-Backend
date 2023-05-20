import { config as dotEnvConfig } from "dotenv";
import mongoose from "mongoose";

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
  namespace Express {
    export interface Request {
      user: any;
    }
  }
}

function appConfig() {
  dotEnvConfig();
  mongoose.connect(process.env.DATABASE_URL);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("connected to database"));
}

export { appConfig };
