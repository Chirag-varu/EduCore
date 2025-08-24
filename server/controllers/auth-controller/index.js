import "dotenv/config";
import User from "../../models/User.js";
import pkg from "bcryptjs";
const { hash, compare } = pkg;
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;
import { Router } from "express";
const router = Router();

// Google auth implementation
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if user exists or create new user
    let user = await User.findOne({ userEmail: payload.email });
    if (!user) {
      const password = "password"; // Use "password" as password for simplicity
      const hashPassword = await hash(password, 10);
      user = new User({
        userName: payload.name,
        userEmail: payload.email,
        role: "student",
        password: hashPassword,
      });
      await user.save();
    }
    // Generate JWT token
    const accessToken = sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120m" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

const registerUser = async (req, res) => {
  const { userName, userEmail, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User name or user email already exists",
    });
  }

  const hashPassword = await hash(password, 10);
  const newUser = new User({
    userName,
    userEmail,
    role,
    password: hashPassword,
  });

  await newUser.save();

  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
  });
};

const loginUser = async (req, res) => {
  try {
    const { userEmail, password } = req.body;

    const checkUser = await User.findOne({ userEmail });

    if (!checkUser || !(await compare(password, checkUser.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = sign(
      {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120m" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        accessToken,
        user: {
          _id: checkUser._id,
          userName: checkUser.userName,
          userEmail: checkUser.userEmail,
          role: checkUser.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export default { registerUser, loginUser, googleLogin };
