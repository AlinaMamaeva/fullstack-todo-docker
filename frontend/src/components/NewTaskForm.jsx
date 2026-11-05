import { useState, useRef } from "react";
import PropTypes from "prop-types";

function NewTaskForm({ addTask }) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!text.trim()) return;

      try {
        await addTask(text, selectedFile);

        setText("");
        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Failed to create task:", error);
        alert(error.message);
      }
    }
  };

  return (
    <header className="header">
      <h1>todos</h1>
      <input
        className="new-todo"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="What needs to be done?"
        autoFocus
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          setSelectedFile(event.target.files?.[0] || null);
        }}
      />
    </header>
  );
}
NewTaskForm.propTypes = {
  addTask: PropTypes.func.isRequired,
};

export default NewTaskForm;
