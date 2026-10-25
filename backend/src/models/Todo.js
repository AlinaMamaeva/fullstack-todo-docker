const mongoose = require("mongoose");

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
  dueDate: -1,
});

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
