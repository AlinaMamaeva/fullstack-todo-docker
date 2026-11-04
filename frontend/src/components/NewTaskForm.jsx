import { useState, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";

function NewTaskForm({ addTask }) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    setText(event.target.value);
  };

 const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("/api/uploads", formData);

  return response.data.url;
};

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!text.trim()) return;

      try {
        let imageUrl = "";

        if (selectedFile) {
          imageUrl = await uploadImage(selectedFile);
        }

        await addTask(text, imageUrl);

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
