import jwt, { JwtPayload } from "jsonwebtoken";
import { UserInterface } from "../db/models/user";

interface JwtAuthenticationPayload extends JwtPayload, UserInterface { }

const checkIfAuthenticationPayload = (obj: Record<string, unknown>): obj is JwtAuthenticationPayload => {
  const toCheck = obj as JwtAuthenticationPayload;

  return typeof toCheck?.uuid === "string" &&
    typeof toCheck.email === "string";
};

const checkJwt = (token: string, key: string): Promise<JwtAuthenticationPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, key, (err, payload) => {
      if (err) {
        console.error("Failed to verify user", err);
        return reject(403);
      }

      if (typeof payload != "object" || !checkIfAuthenticationPayload(payload)) {
        console.error("Bad payload to verify user", payload);

        return reject(403);
      }

      return resolve(payload);
    });
  });
};

export default async (token: string, key: string) => {
  return await checkJwt(token, key);
};