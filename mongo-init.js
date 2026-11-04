
db = db.getSiblingDB("todoapp");

db.createCollection("todos");

db.todos.createIndex({ createdAt: -1 });
db.todos.createIndex({ completed: 1 });
db.todos.createIndex({ priority: 1 });
db.todos.createIndex({ dueDate: 1 });

db.todos.insertMany([
  {
    title: "Learn Docker",
    description: "Practice Docker Compose",
    completed: false,
    priority: "high",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Learn Redis",
    description: "Practice Redis caching",
    completed: false,
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
