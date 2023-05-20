import { NextFunction, Request, Response } from "express";
export type CallbackFn = (
  req: Request,
  res: Response,
  next?: NextFunction
) => any;
