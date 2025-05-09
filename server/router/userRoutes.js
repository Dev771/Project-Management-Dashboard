import express from "express";

import { getProjectMembers, getAllUsers, addCandidateToProject, removeCandidateFromProject, updateCandidateDetails } from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:project_id", authMiddleware.verifyToken, getAllUsers);
router.get("/project/:project_id", authMiddleware.verifyToken, getProjectMembers);
router.post("/:project_id/candidates", authMiddleware.verifyToken, addCandidateToProject);
router.patch("/:project_id/candidates", authMiddleware.verifyToken, updateCandidateDetails);
router.delete("/:project_id/candidates/:candidateId", authMiddleware.verifyToken, removeCandidateFromProject);

export default router;