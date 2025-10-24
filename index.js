import { app } from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import dotenv from "dotenv";
import { redisClient } from "./src/config/redis.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(async () => {
    await redisClient.connect();
  })
  .then(() => {
    app.listen(process.env.PORT || 8002, () => {
      console.log("Server is Running");
    });
  })
  .catch(err => {
    console.log("Error in Server Connection", err);
  });
