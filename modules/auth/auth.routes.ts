import { Router } from "express";
import { createUserController, loginUserController, resendVerificationController, resetPasswordController, userLogoutController, verifyEmailController } from "./auth.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post("/sign-up", createUserController);
router.post("/sign-in", loginUserController)
router.post("/logout", authMiddleware, userLogoutController);
router.put("/reset-password", resetPasswordController);

router.get("/verify-email", verifyEmailController);

router.post("/resend-verification", resendVerificationController);

export const authRoutes = router