import type { Request, Response, NextFunction } from "express";
import type { Server } from "socket.io";

import todoService from "../services/todoService.js";
import redisClient from "../config/redis.js";

const {
  createTodo: createTodoService,
  getTodo: getTodoService,
  getTodos: getTodosService,
  updateTodo: updateTodoService,
  deleteTodo: deleteTodoService,
  toggleTodo: toggleTodoService,
} = todoService;

// Get Socket.IO server from Express
function getIO(req: Request): Server {
  return req.app.get("io") as Server;
}

async function clearTodosCache() {
  const keys = await redisClient.keys("todos:*");

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

// Toggle completed
export const toggleTodo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const todo = await toggleTodoService(req.params.id);

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    await clearTodosCache();

    getIO(req).to("workspace:default").emit("todo:updated", todo);
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Create todo
export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const todo = await createTodoService(req.body);
    await clearTodosCache();

    getIO(req).to("workspace:default").emit("todo:created", todo);
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

// Get one todo
export const getTodo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const todo = await getTodoService(req.params.id);

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Get all todos

export const getTodos = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cacheKey = `todos:${JSON.stringify(req.query)}`;

    // 1. Check Redis cache
    const cachedTodos = await redisClient.get(cacheKey);

    if (cachedTodos !== null) {
      console.log("Todos from Redis cache");
      res.json(JSON.parse(cachedTodos));
      return;
    }

    // 2. Get todos from MongoDB
    const todos = await getTodosService(
      req.query.completed,
      req.query.limit,
      req.query.page,
      req.query.sort,
    );

    // 3. Save result to Redis for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(todos), {
      EX: 60,
    });

    console.log("Todos from MongoDB");
    res.json(todos);
  } catch (error) {
    next(error);
  }
};

// Update todo
export const updateTodo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const todo = await updateTodoService(req.params.id, req.body);

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    await clearTodosCache();

    getIO(req).to("workspace:default").emit("todo:updated", todo);
    res.json(todo);
  } catch (error) {
    next(error);
  }
};

// Delete todo
export const deleteTodo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const todo = await deleteTodoService(req.params.id);

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    await clearTodosCache();

    getIO(req).to("workspace:default").emit("todo:deleted", {
      id: req.params.id,
    });

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    next(error);
  }
};
