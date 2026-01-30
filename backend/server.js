const express = require("express")
const app = express();
const env = require("dotenv");
const connectDB = require("./config/db");
const router = require("./Router/userRouter");
const cors = require("cors")

env.config();
connectDB();
app.use(cors())
app.use(express.json());
app.use("/api/v1/auth",router)


app.listen("3000",()=>{
    console.log("Successfully running")
})
