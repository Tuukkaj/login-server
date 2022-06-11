import express from "express";

const testRouter = express.Router();

testRouter.post("/", (req, res) => {
  return res.send("OK");
});

export default testRouter;