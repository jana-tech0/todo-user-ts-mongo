import express, {Request,Response,NextFunction} from "express";
const app = express();
app.use(express.json());

import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {UserModel, TodoModel}  from "./db"
import { dot } from "node:test/reporters";



app.use(cors())

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL as string;
const JWT_SECRET = "jana@119";

mongoose.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection Error"))

    
    
    app.post("/signup", async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;
    
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: "User already exists" });
            }
            return

    
            const hashedPassword = await bcrypt.hash(password, 10);
            await UserModel.create({ name, email, password: hashedPassword });
    
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error"});
        }
    });

    app.post("/signin", async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await UserModel.findOne({ email });
    
            if (!user) {
                res.status(403).json({ message: "User not found in database" });
                return;
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.status(403).json({ message: "Incorrect credentials" });
                return;
            }
    
            const token = jwt.sign({ id: user._id}, JWT_SECRET, { expiresIn: "1h" });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error"});
        }
    });


    function auth(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
    
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "No token provided" });
            }
    
            const token = authHeader.split(" ")[1];
    
            jwt.verify(token, JWT_SECRET, (err, decodedData) => {
                if (err) {
                    return res.status(403).json({ message: "Invalid token" });
                }
    
                (req as any).userId = (decodedData as { id: string }).id;
                next();
            });
        } catch (error) {
            return res.status(500).json({ message: "Server Error"});
        }
    }

    app.post("/todo", auth, async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;
            const { title, done } = req.body;
    
            if (!title) {
                return res.status(400).json({ message: "Title is required" });
            }
    
            const newTodo = await TodoModel.create({
                title,
                userId,
                done: done || false,
            });
    
            res.status(201).json({ message: "Todo created", todo: newTodo });
        } catch (error) {
            res.status(500).json({ message: "Server error"});
        }
    });

app.listen(3000,() => {
    console.log("The server is running at localhost 3000/")
})