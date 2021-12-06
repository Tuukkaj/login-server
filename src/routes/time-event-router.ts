import express from "express"; 

const timeEventRouter = express.Router();

timeEventRouter.get("/", (req, res) => {
    return res.send([]); 
});

export default timeEventRouter; 