const mongoose = require("mongoose");

const NotebookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Notebook name is required"],
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "#2F5D50",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notebook", NotebookSchema);
