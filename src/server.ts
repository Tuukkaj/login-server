import express from "express";
import dotenv from "dotenv"; 
import timeEventRouter from "./routes/time-event-router";
import dbConnection from "./db/db-connection";

(async () => {
    dotenv.config();

    await dbConnection.init();

    const app = express();
    
    app.use("/api/time", timeEventRouter);
    
    app.listen(process.env.PORT, () => console.log("🦻🏼 Listening to port " + process.env.PORT));
})();

