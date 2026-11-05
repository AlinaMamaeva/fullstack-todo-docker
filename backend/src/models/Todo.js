import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        mimetype: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    imageUrl: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          return (
            value === "" ||
            /^\/uploads\/[a-f0-9-]+\.(jpg|jpeg|png|webp)$/.test(value)
          );
        },
        message: "Invalid image URL",
      },
    },
  },
  {
    timestamps: true,
  },
);

todoSchema.index({
  createdAt: -1,
});

todoSchema.index({
  completed: 1,
});

todoSchema.index({
  priority: 1,
});

todoSchema.index({
  dueDate: -1,
});

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
