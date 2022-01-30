import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserInterface } from "../db/models/user";

interface JwtAuthenticationPayload extends JwtPayload, UserInterface { }

const checkIfAuthenticationPayload = (obj: Record<string, unknown>): obj is JwtAuthenticationPayload => {
  const toCheck = obj as JwtAuthenticationPayload;

  return typeof toCheck?.uuid === "string" &&
    typeof toCheck.email === "string";
};

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !/Bearer\s.+/.test(authHeader)) {
    return res.status(400).send("Bad authorization header");
  }

  jwt.verify(authHeader.split(" ")[1], process.env.PRIVATE_ACCESS_KEY || "", (err, payload) => {
    if (err) {
      console.error("Failed to verify user", err);
      return res.sendStatus(403);
    }

    if (typeof payload != "object" || !checkIfAuthenticationPayload(payload)) {
      console.error("Bad payload to verify user", payload);

      return res.sendStatus(403);
    }

    req.user = payload;
    next();
  });
};

