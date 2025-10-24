import { Router } from "express";
import {
  createTask,
  getTasks,
  deleteTask,
  changeTaskStatus,
  commentOnTask,
  suggestTaskDetails,
} from "../controllers/task.controller.js";

import { protectRoute, checkVerified } from "../middlewares/auth.middleware.js";
import { multerUpload } from "../middlewares/multer.middleware.js";

const router = Router();

// All routes below are protected and require verified user
router.use(protectRoute);
router.use(checkVerified);

router.post("/suggest-details", suggestTaskDetails);
router.post("/", createTask);
router.get("/", getTasks);
router.delete("/:taskId", deleteTask);
router.patch("/:taskId/status", changeTaskStatus);
router.post(
  "/:taskId/comment",
  multerUpload.array("attachments", 5),
  commentOnTask
);

export default router;
