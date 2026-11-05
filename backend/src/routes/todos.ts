import { Router } from "express";

import {
  toggleTodo,
  createTodo,
  getTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} from "../controllers/todoController.js";

import { upload } from "../middleware/upload.js";
import { getAnalytics } from "../services/analyticsService.js";

const router = Router();

// Create todo
router.post("/todos", upload.array("attachments", 5), createTodo);

// Get todo by ID
router.get("/todos/:id", getTodo);

// Get all todos
router.get("/todos", getTodos);

// Update todo
router.patch("/todos/:id", updateTodo);

router.put("/todos/:id", updateTodo);

// Toggle completed status
router.patch("/todos/:id/toggle", toggleTodo);

// Delete todo
router.delete("/todos/:id", deleteTodo);

router.get("/analytics", async (req, res, next) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});
export default router;
