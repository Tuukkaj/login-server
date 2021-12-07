import express from "express";
import dotenv from "dotenv";
import timeEventRouter from "./routes/time-event-router";
import dbConnection from "./db/db-connection";
import authenticationRouter from "./routes/authentication-router";
import EmailService from "./services/email-service";

(async () => {
  dotenv.config();

  await dbConnection.init();
  
  EmailService.init(); 

  const app = express();

  app.use(express.json()); 

  app.use("/time", timeEventRouter);
  app.use("/authentication", authenticationRouter); 

  app.listen(process.env.PORT, () => console.log("🦻🏼 Listening to port " + process.env.PORT));
})();

