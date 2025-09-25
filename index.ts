import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { authRoutes } from "./modules/auth/auth.routes";
import dotenv from "dotenv";
import authMiddleware from "./modules/middlewares/auth.middleware";
import { checkPermission } from "./modules/middlewares/permission.middleware";
import { checkRole } from "./modules/middlewares/role.middleware";

const app = express();
const port = process.env.DEV_PORT

dotenv.config()

// middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());


// routes
app.use("/auth", authRoutes);
app.get("/", (req: Request, res: Response) => {
    res.send("This is a test route")
});

app.get("/api/admin", authMiddleware, (req: Request, res: Response) => {
    return res.send("Welcome admin")
});


app.get("/api/dashboad", authMiddleware, checkRole("admin"), checkPermission("user:create"), (req: Request, res: Response) => {
    return res.status(200).json({
        message: "Welcome to the admin dashboard"
    })
});


app.get("/profile", authMiddleware, (req: Request, res: Response) => {
    return res.status(200).json({
        message: `Welcome ${req.user.username}`,
        user: req.user
    })
})

// listen to the server
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`)
});