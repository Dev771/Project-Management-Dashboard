import express from "express";
import AuthRoutes from "./authRoutes.js";
import ProjectRoutes from "./projectRoutes.js";
import TaskRoutes from "./taskRoutes.js";
import UserRoutes from "./userRoutes.js";

const router = express();

router.use("/auth", AuthRoutes);
router.use("/projects", ProjectRoutes);
router.use("/tasks", TaskRoutes);
router.use("/users", UserRoutes);

export default router;