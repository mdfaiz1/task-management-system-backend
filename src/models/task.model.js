import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }], // optional file URLs
  },
  { timestamps: true }
);

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null }, // optional
    teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null }, // null if personal task

    // ✅ Embedded comments
    comments: [commentSchema],
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
