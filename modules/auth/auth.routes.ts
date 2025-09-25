import { Router } from "express";
import { createUserController, loginUserController, userLogoutController } from "./auth.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/sign-up", createUserController);
router.post("/sign-in", loginUserController)
router.post("/logout", authMiddleware, userLogoutController)

export const authRoutes = router