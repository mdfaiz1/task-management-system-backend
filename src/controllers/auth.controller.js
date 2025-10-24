import { User } from "../models/user.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log(req.body);

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    // 2. Check if user already exists
    const existUser = await User.findOne({ email: email });
    if (existUser) {
      return res.status(400).json({ message: "User Email Already Exist" });
    }

    // 3. Generate OTP (valid for 5 minutes)
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    console.log(otp);

    // 4. Create new user (save OTP + expiry in DB)
    const newUser = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiresAt,
    });

    if (!newUser) {
      return res.status(500).json({ message: "User Not Registered" });
    }

    // 5. Send email (placeholder right now)
    // TODO: Implement nodemailer / Brevo / SendGrid

    // 6. Create JWT token valid for 10 minutes
    const token = jwt.sign(
      { email: newUser.email, _id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // 7. Optionally set cookie for authentication
    res.cookie("taskToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 Day
    });

    // 8. Respond
    return res.status(200).json({
      status: true,
      message: "User registered successfully. OTP sent to email.",
      token: token,
    });
  } catch (error) {
    console.log("Error in Create User", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    // 1. Validate request
    if (!otp) {
      return res.status(400).json({ message: "OTP Required" });
    }

    // If you stored user in req.user (e.g., via middleware)
    const user = req.user;

    if (!user || !user.email) {
      return res.status(400).json({ message: "Invalid user session" });
    }

    // 2. Find user from DB
    const dbUser = await User.findOne({ email: user.email });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check OTP match
    if (dbUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 4. Check OTP expiry
    if (dbUser.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 5. OTP verified → clear OTP fields
    dbUser.otp = null;
    dbUser.otpExpiresAt = null;
    dbUser.isVerified = true;
    await dbUser.save();

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("Error in Verify Otp", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({ message: "All Fields Required" });
    }

    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
      return res
        .status(200)
        .json({ message: "User Not Exist. Please Register First" });
    }
    const token = jwt.sign(
      { email: isUserExist.email, _id: isUserExist._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    // Optional: Set token in cookie
    res.cookie("taskToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 Day
    });
    return res
      .status(201)
      .json({ status: true, message: "Login Successfully", token: token });
  } catch (error) {
    console.log("Error in  Login", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("taskToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    console.log("Error in Logout", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
