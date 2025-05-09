import express from "express";
import { SignInUser, SignUpUser, getUserDetails } from "../controller/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", SignInUser);
router.post("/register", SignUpUser);

router.get("/getUserDetails", authMiddleware.verifyToken, getUserDetails);

export default router;