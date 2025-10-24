import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.taskToken;
    // console.log("Token in protectRoute:", token);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - No Token Found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorised - Invalid Token" });
    }
    // console.log(decoded);
    // return [];

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorised" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in Protected Route", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkVerified = (req, res, next) => {
  try {
    if (!req.user?.isVerified) {
      return res
        .status(403)
        .json({ status: false, message: "Please verify your account first" });
    }
    next();
  } catch (error) {
    console.log("Error in Verifiying User", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
