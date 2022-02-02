import { NextFunction, Request, Response } from "express";
import checkJwt from "../util/check-jwt";

export default async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !/Bearer\s.+/.test(authorization)) {
    return res.sendStatus(400);
  }

  try {
    const jwtResult = await checkJwt(authorization.split(" ")[1], process.env.TOKEN_KEY || "");

    req.user = jwtResult;
    next();
  } catch (e) {
    return res.sendStatus(e as number || 400);
  }
};

