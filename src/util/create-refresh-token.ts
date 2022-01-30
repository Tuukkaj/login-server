import jwt from "jsonwebtoken";

export default (uuid: string, email: string) => {
  const data = {
    uuid: uuid,
    email: email
  };

  return jwt.sign(data, process.env.REFRESH_TOKEN_KEY || "",
    {
      expiresIn: "3d",
      issuer: "login"
    });
};