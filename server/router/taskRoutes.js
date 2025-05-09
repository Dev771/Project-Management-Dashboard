import express from 'express';
import { getAllTasks, addTask, updateTask, deleteTask, getAllComments, addComment } from "../controller/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:projectId", authMiddleware.verifyToken, getAllTasks);
router.post("/:projectId", authMiddleware.verifyToken, addTask);
router.put("/:projectId/:taskId", authMiddleware.verifyToken, updateTask);
router.delete("/:projectId/:taskId", authMiddleware.verifyToken, deleteTask);

router.get("/:projectId/comments/:taskId", authMiddleware.verifyToken, getAllComments);
router.post("/:projectId/comments", authMiddleware.verifyToken, addComment);

export default router;