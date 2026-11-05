import NewTaskForm from "./components/NewTaskForm";
import TaskList from "./components/TaskList";
import Footer from "./components/Footer";

import { useEffect, useState } from "react";
import "./App.css";
import TasksFilter from "./components/TasksFilter";

import { io } from "socket.io-client";
import axios from "axios";

const API_URL = __API_URL__;
const API_ORIGIN = new URL(API_URL).origin;

const api = axios.create({
  baseURL: API_ORIGIN,
});

function App() {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const socket = io(API_ORIGIN);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      socket.emit("workspace:join", {
        workspace: "default",
        username: "Guest",
      });
    });

    socket.on("presence:update", (data) => {
      setOnlineUsers(data.users);
    });

    socket.on("todo:created", (newTodo) => {
      console.log("New todo received:", newTodo);
      setTasks((prev) => {
        const exists = prev.some((task) => task._id === newTodo._id);

        if (exists) return prev;

        return [newTodo, ...prev];
      });
    });

    socket.on("todo:updated", (updatedTodo) => {
      console.log("Todo updated:", updatedTodo);
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTodo._id ? updatedTodo : task)),
      );
    });

    socket.on("todo:deleted", ({ id }) => {
      console.log("Todo deleted:", id);

      setTasks((prev) => prev.filter((task) => task._id !== id));

      setEditingTaskId((prev) => (prev === id ? null : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, [API_ORIGIN]);

  //api from backend
  useEffect(() => {
    api
      .get("/api/todos")
      .then((response) => {
        const data = response.data;

        setTasks(Array.isArray(data) ? data : data.todos);
      })
      .catch((error) => {
        console.error("Failed to fetch todos:", error);
      });
  }, []);

  const toggleStatus = (id) => {
    api
      .patch(`/api/todos/${id}/toggle`)
      .then((response) => {
        const updatedTask = response.data;

        setTasks((prev) =>
          prev.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        );
      })
      .catch((error) => {
        console.error("Failed to toggle todo:", error);
      });
  };
  const deleteTask = (id) => {
    api
      .delete(`/api/todos/${id}`)
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));

        setEditingTaskId((prev) => (prev === id ? null : prev));
      })
      .catch((error) => {
        console.error("Failed to delete todo:", error);
      });
  };

  const updateTask = (id, newTitle) => {
    api
      .patch(`/api/todos/${id}`, {
        title: newTitle,
      })
      .then((response) => {
        const updatedTask = response.data;

        setTasks((prev) =>
          prev.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        );

        setEditingTaskId(null);
      })
      .catch((error) => {
        console.error("Failed to update todo:", error);
      });
  };

  const toggleEdit = (id) => {
    setEditingTaskId((prev) => (prev === id ? null : id));
  };

  const addTask = async (text, file = null) => {
    const formData = new FormData();

    formData.append("title", text);

    if (file) {
      formData.append("attachments", file);
    }

    const response = await api.post("/api/todos", formData);

    const newTask = response.data;

    setTasks((prev) => {
      const exists = prev.some((task) => task._id === newTask._id);

      if (exists) return prev;

      return [newTask, ...prev];
    });
  };

  const [filter, setFilter] = useState("All");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });
  const activeTasks = tasks.filter((task) => !task.completed).length;

  const clearCompleted = () => {
    const completedTasks = tasks.filter((task) => task.completed);

    Promise.all(
      completedTasks.map((task) => api.delete(`/api/todos/${task._id}`)),
    )
      .then(() => {
        setTasks((prev) => prev.filter((task) => !task.completed));
      })
      .catch((error) => {
        console.error("Failed to clear completed todos:", error);
      });
  };

  return (
    <section className="todoapp">
      <p>🟢 Online: {onlineUsers.length}</p>

      <NewTaskForm addTask={addTask} />

      <TaskList
        tasks={filteredTasks}
        toggleStatus={toggleStatus}
        deleteTask={deleteTask}
        updateTask={updateTask}
        toggleEdit={toggleEdit}
        editingTaskId={editingTaskId}
      />

      <Footer clearCompleted={clearCompleted} activeTasks={activeTasks}>
        <TasksFilter filter={filter} setFilter={setFilter} />
      </Footer>
    </section>
  );
}

export default App;
