import { Team } from "../models/team.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
// import { geminiClient as client } from "../utils/geminiClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const suggestTaskDetails = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    }

    const enhancedPrompt = `
      Suggest a task with these details:
      - title
      - description
      - dueDate (YYYY-MM-DD)
      - status (open, in-progress, completed)
      - priority (low, medium, high)
      Based on: ${prompt}
      IMPORTANT: Return only pure JSON without markdown, explanation, or extra text.
    `;

    // ✅ Use the correct model call
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(enhancedPrompt);

    // ✅ Extract text safely
    const rawText = result.response.text();
    console.log("Gemini Raw Response:", rawText);

    // ✅ Extract JSON if wrapped in ```json ... ```
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    let taskSuggestion;

    if (jsonMatch) {
      taskSuggestion = JSON.parse(jsonMatch[0]);
    } else {
      taskSuggestion = { error: "No valid JSON found", raw: rawText };
    }

    return res.status(200).json({
      success: true,
      suggestion: taskSuggestion,
    });
  } catch (error) {
    console.error("Error generating task suggestion:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, teamId } = req.body;
    const creatorId = req.user?._id;
    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Task title is required" });
    }
    const newTask = new Task({
      title,
      description: description || "",
      dueDate: dueDate || null,
      createdBy: creatorId,
      assignedTo: assignedTo || null,
      teamId: teamId || null,
    });

    await newTask.save();
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error in Creating Task:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { type, teamId } = req.query;
    // type can be: "personal", "assigned", "team"

    let filter = {};

    if (type === "personal") {
      // Personal tasks (not linked to any team)
      filter = {
        teamId: null,
        $or: [{ createdBy: userId }, { assignedTo: userId }],
      };
    } else if (type === "assigned") {
      // Tasks assigned specifically to me
      filter = { assignedTo: userId };
    } else if (type === "team" && teamId) {
      // Check if user is team owner
      const team = await Team.findById(teamId);
      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }

      if (team.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view team tasks",
        });
      }

      // Team admin can see all tasks under the team
      filter = { teamId };
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request. Provide type=personal|assigned|team (with teamId).",
      });
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("teamId", "name");

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error in Fetching Tasks:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const changeTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const validStatuses = ["open", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }
    const task = await Task.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    task.status = status;
    await task.save();
    return res
      .status(200)
      .json({ success: true, message: "Task status updated", task });
  } catch (error) {
    console.error("Error in Changing Task Status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?._id;

    // 1. Find the task
    const task = await Task.findById(taskId).populate("teamId");
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // 2. Check if it's a personal task
    if (!task.teamId) {
      // personal task → only creator can delete
      if (task.createdBy.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this personal task",
        });
      }
    } else {
      // 3. Team task → only team owner can delete
      const team = task.teamId; // already populated
      if (team.owner.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Only team owner can delete team tasks",
        });
      }
    }

    // 4. Delete task
    await Task.findByIdAndDelete(taskId);

    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in Deleting Task:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const commentOnTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    // Validate input
    // if (!content && (!req.files || req.files.length === 0)) {
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment  required",
      });
    }

    // Find task and populate team info if any
    const task = await Task.findById(taskId).populate("teamId");
    if (!task)
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });

    // Handle attachments (if any)
    const attachments = req.files?.map(file => file.path) || [];

    // ----- Permission Check -----
    if (task.teamId) {
      // Team task → only team owner or team member can comment
      const team = task.teamId;
      const isOwner = team.owner.toString() === userId.toString();
      const isMember = team.members.some(
        member => member.toString() === userId.toString()
      );

      if (!isOwner && !isMember) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to comment on this team task",
        });
      }
    } else {
      // Personal task → only creator or assigned user can comment
      const isCreator = task.createdBy.toString() === userId.toString();
      const isAssignee = task.assignedTo?.toString() === userId.toString();

      if (!isCreator && !isAssignee) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to comment on this personal task",
        });
      }
    }

    // ----- Add Comment -----
    const newComment = {
      user: userId,
      content,
      attachments,
    };

    task.comments.push(newComment);
    await task.save();

    // Populate user info for frontend
    const populatedTask = await Task.findById(taskId).populate(
      "comments.user",
      "name email"
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comments: populatedTask.comments,
    });
  } catch (error) {
    console.error("Error in Commenting on Task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
