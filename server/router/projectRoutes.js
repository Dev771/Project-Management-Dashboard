import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { AddNewProject, getAllProjects, getProjectDetails } from "../controller/projectController.js";

const router = express.Router();

router.get("/", authMiddleware.verifyToken, getAllProjects);
router.post("/", authMiddleware.verifyToken, AddNewProject);
router.get("/:project_id", authMiddleware.verifyToken, getProjectDetails);

export default router;