import {
  createUser,
  verifyOtp,
  login,
  logout,
} from "../controllers/auth.controller.js";
import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/verify-otp", protectRoute, verifyOtp);
router.post("/login", login);
router.post("/logout", protectRoute, logout);

export default router;
