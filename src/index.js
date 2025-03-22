"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
app.use((0, cors_1.default)());
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = "jana@119";
mongoose_1.default.connect(MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("MongoDB connection Error"));
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existingUser = yield db_1.UserModel.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
        }
        return;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield db_1.UserModel.create({ name, email, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield db_1.UserModel.findOne({ email });
        if (!user) {
            res.status(403).json({ message: "User not found in database" });
            return;
        }
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(403).json({ message: "Incorrect credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decodedData) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }
            req.userId = decodedData.id;
            next();
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
}
app.post("/todo", auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { title, done } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const newTodo = yield db_1.TodoModel.create({
            title,
            userId,
            done: done || false,
        });
        res.status(201).json({ message: "Todo created", todo: newTodo });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}));
app.listen(3000, () => {
    console.log("The server is running at localhost 3000/");
});
