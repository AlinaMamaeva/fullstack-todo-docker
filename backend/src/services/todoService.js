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
async function getTodos(completed, limit, page, sort) {
  const filter = {};

  let skip = 0;

  // default limit
  if (limit === undefined) {
    limit = 10;
  }

  // completed filter
  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  const query = Todo.find(filter);

  // limit validation
  if (
    Number.isNaN(Number(limit)) ||
    Number(limit) <= 0 ||
    Number(limit) > 100
  ) {
    const error = new Error("Invalid limit");
    error.statusCode = 400;
    throw error;
  }

  query.limit(Number(limit));

  // page validation
  if (page !== undefined) {
    if (Number.isNaN(Number(page)) || Number(page) <= 0) {
      const error = new Error("Invalid page");
      error.statusCode = 400;
      throw error;
    }

    skip = (Number(page) - 1) * Number(limit);

    query.skip(skip);
  }

  // sort
  if (sort !== undefined) {
    const allowedSortFields = ["createdAt", "dueDate", "completed"];

    const sortFields = sort.split(",");

    const sortObject = {};

    for (const field of sortFields) {
      const sortField = field.startsWith("-") ? field.slice(1) : field;

      if (!allowedSortFields.includes(sortField)) {
        const error = new Error("Invalid sort field");
        error.statusCode = 400;
        throw error;
      }

      sortObject[sortField] = field.startsWith("-") ? -1 : 1;
    }

    query.sort(sortObject);
  }

  const todos = await query;

  return todos;
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
