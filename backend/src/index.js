import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import bodyParser from "body-parser";
import { connectToDb } from "./lib/db.js";
import { app,server } from "./lib/socket.js"
import path from "path"

dotenv.config();
const port = process.env.PORT;
const __dirname = path.resolve();

app.use(bodyParser.json({ limit: "10mb" }));  
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);


if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}

// app.get("/", (req, res) => {
//     res.send("Server is running...");
//   });
  

server.listen(port,"0.0.0.0",()=> {
    connectToDb();
    console.log(`Server is running at port ${port}`);
})