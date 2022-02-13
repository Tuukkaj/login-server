import jwt from "jsonwebtoken";

export default (uuid: string, email: string) => {
  const data = {
    uuid: uuid,
    email: email
  };

  return jwt.sign(data, process.env.TOKEN_KEY || "",
    {
      expiresIn: "2h",
      issuer: "login"
    });
};