import express from "express";
import testRouter from "./routes/test-router";
import dbConnection from "./db/db-connection";
import authenticationRouter from "./routes/authentication-router";
import EmailService from "./services/email-service";
import jwtAuthenticationMiddleware from "./middlewares/jwt-authentication-middleware";
import cacheConnection from "./cache/cache_connection";

(async () => {
  await cacheConnection.init();
  await dbConnection.init();

  await EmailService.init();

  const app = express();

  app.use(express.json());

  app.use("/test", jwtAuthenticationMiddleware, testRouter);
  app.use("/authentication", authenticationRouter);

  app.listen(process.env.PORT, () => console.log("🦻🏼 Listening to port " + process.env.PORT));
})();

