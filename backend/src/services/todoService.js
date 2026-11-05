import Todo from "../models/Todo.js";

// create todo
async function createTodo(data) {
  const todo = await Todo.create(data);

  return todo;
}

// get one todo
async function getTodo(id) {
  const todo = await Todo.findById(id);

  return todo;
}

// get all todos

async function getTodos(
  completed,
  limit = 10,
  page = 1,
  sort,
  status,
  priority,
) {
  const filter = {};

  if (status !== undefined) {
    if (!["completed", "pending", "all"].includes(status)) {
      const error = new Error("Invalid status");
      error.statusCode = 400;
      throw error;
    }

    if (status === "completed") filter.completed = true;
    if (status === "pending") filter.completed = false;
  } else if (completed !== undefined) {
    if (!["true", "false"].includes(completed)) {
      const error = new Error("Invalid completed filter");
      error.statusCode = 400;
      throw error;
    }
    filter.completed = completed === "true";
  }

  if (priority !== undefined) {
    if (!["low", "medium", "high"].includes(priority)) {
      const error = new Error("Invalid priority");
      error.statusCode = 400;
      throw error;
    }
    filter.priority = priority;
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(limitNumber) ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    const error = new Error("Invalid pagination");
    error.statusCode = 400;
    throw error;
  }

  const query = Todo.find(filter)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  if (sort !== undefined) {
    const allowed = ["createdAt", "dueDate", "completed", "priority"];
    const sortObject = {};

    for (const field of sort.split(",")) {
      const name = field.startsWith("-") ? field.slice(1) : field;

      if (!allowed.includes(name)) {
        const error = new Error("Invalid sort field");
        error.statusCode = 400;
        throw error;
      }

      sortObject[name] = field.startsWith("-") ? -1 : 1;
    }

    query.sort(sortObject);
  } else {
    query.sort({ createdAt: -1 });
  }

  const [todos, total] = await Promise.all([
    query.exec(),
    Todo.countDocuments(filter),
  ]);

  return {
    todos,
    total,
    page: pageNumber,
    limit: limitNumber,
  };
}

// update
async function updateTodo(id, data) {
  const todo = await Todo.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return todo;
}

// delete
async function deleteTodo(id) {
  const todo = await Todo.findByIdAndDelete(id);

  return todo;
}

// toggle
async function toggleTodo(id) {
  const todo = await Todo.findById(id);

  if (!todo) {
    return null;
  }

  todo.completed = !todo.completed;

  await todo.save();

  return todo;
}

export default {
  createTodo,
  getTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  toggleTodo,
};
