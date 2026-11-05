import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import PropTypes from "prop-types";

function Task(props) {
  const { task, toggleStatus, deleteTask, updateTask, toggleEdit, isEditing } =
    props;

  const [value, setValue] = useState(task.title);
  const imageUrl = task.attachments?.[0]?.filename
    ? `/uploads/${encodeURIComponent(task.attachments[0].filename)}`
    : task.imageUrl;

  useEffect(() => {
    setValue(task.title);
  }, [task.title]);

  return (
    <li
      className={`${task.completed ? "completed" : ""} ${isEditing ? "editing" : ""}`}
    >
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleStatus(task._id)}
        />

        <label>
          <span className="title">{task.title}</span>

          {imageUrl && (
            <img src={imageUrl} alt={task.title} className="task-image" />
          )}

          <span className="created">
            created{" "}
            {task.createdAt
              ? formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                  includeSeconds: true,
                })
              : "unknown"}{" "}
          </span>
        </label>

        <button
          className="icon icon-edit"
          onClick={() => toggleEdit(task._id)}
        ></button>

        <button
          className="icon icon-destroy"
          onClick={() => deleteTask(task._id)}
        ></button>
      </div>

      {isEditing && (
        <input
          type="text"
          className="edit"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              updateTask(task._id, value);
            }
            if (e.key == "Escape") {
              toggleEdit(task._id);
            }
          }}
        />
      )}
    </li>
  );
}

Task.propTypes = {
  task: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    createdAt: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        filename: PropTypes.string.isRequired,
        originalName: PropTypes.string,
        mimetype: PropTypes.string,
        size: PropTypes.number,
      }),
    ),
  }).isRequired,

  toggleStatus: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
  toggleEdit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default Task;
