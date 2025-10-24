import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`
    );
    console.log(
      "Mongo DB Connection Successfull",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Error in DB connection", error);
    process.exit(1);
  }
};

export { connectDB };
