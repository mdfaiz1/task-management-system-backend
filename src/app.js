import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import teamRouter from "./routes/team.routes.js";
import taskRouter from "./routes/task.routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (_, res) => {
  res.send("Server is running for Task Management");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/task", taskRouter);

export { app };
