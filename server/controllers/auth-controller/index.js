import "dotenv/config";
import User from "../../models/User.js";
import pkg from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP } from "../../helpers/generateOTP.js";
import redisClient from "../../helpers/redisClient.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { validatePassword, validateEmail, validateUsername } from "../../helpers/validation.js";
const { hash, compare } = pkg;
const { sign } = jwt;

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ userEmail:email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1h expiry

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send email with reset link
    const resetLink = `${process.env.CLIENT_URL}/auth/resetPassword/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: process.env.Email_Service,
      auth: {
        user: process.env.Email,
        pass: process.env.Email_Password,
      },
    });

    await transporter.sendMail({
      from: `"EduCore" <${process.env.Email}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <div style="font-family:sans-serif;">
          <h2>Password Reset</h2>
          <p>Click below link to reset your password:</p>
          <a href="${resetLink}" style="background:#4f46e5; color:white; padding:10px 15px; border-radius:5px; text-decoration:none;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate new password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // check expiry
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const hashedPassword = await hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Google auth implementation
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const chekAuth = (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
};

const registerUser = async (req, res) => {
  try {
    const { userName, userEmail, password, role } = req.body;

    // Validate input fields
    const emailValidation = validateEmail(userEmail);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: emailValidation.message,
      });
    }

    const usernameValidation = validateUsername(userName);
    if (!usernameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: usernameValidation.message,
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ userEmail }, { userName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User name or user email already exists",
      });
    }

    const otp = generateOTP();
    await redisClient.set(
      `otp:${userEmail}`,
      JSON.stringify({ otp, userName, userEmail, password, role }),
      { EX: 300 }
    ); // Save OTP with other details for 5 min expiry

    // Send email
    const transporter = nodemailer.createTransport({
      service: process.env.Email_Service,
      auth: {
        user: process.env.Email,
        pass: process.env.Email_Password,
      },
    });

    await transporter.sendMail({
      from: `"EduCore" <${process.env.Email}>`,
      to: userEmail,
      subject: "Account verification OTP",
      html: `
      <div style="text-align:center; font-family:sans-serif;">
        <h2>Email Verification</h2>
        <p>Use the OTP below to verify your email address:</p>
        <h1 style="background:#4f46e5; color:white; padding:15px; border-radius:8px;">${otp}</h1>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
        <small>If you didn’t request this, please ignore the email.</small>
      </div>
    `,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Register User Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { userEmail, user_otp } = req.body;

    const data = await redisClient.get(`otp:${userEmail}`);
    if (!data) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const { otp, userName, password, role } = JSON.parse(data);
    if (otp !== user_otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await redisClient.del(`otp:${userEmail}`); // OTP is correct → delete it

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
      message: "Email verified, User registered successfully!",
    });
  } catch (error) {
    console.error("Verify User Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during verification",
    });
  }
};

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
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      // Create user without password - they'll set it later
      user = new User({
        userName: payload.name,
        userEmail: payload.email,
        role: "student",
        isGoogleUser: true,
        needsPasswordSetup: true,
        avatarUrl: payload.picture || "",
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
      message: isNewUser ? "Account created successfully" : "Logged in successfully",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          isGoogleUser: user.isGoogleUser,
          needsPasswordSetup: user.needsPasswordSetup,
        },
        isNewUser,
        needsPasswordSetup: user.needsPasswordSetup,
      },
    });
  } catch (error) {
    console.error("Google login error:", error?.message || error);
    res.status(400).json({
      success: false,
      message: "Google authentication failed",
    });
  }
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

// Set password for Google users
const setGoogleUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message: "This endpoint is only for Google users",
      });
    }

    const hashedPassword = await hash(password, 10);
    user.password = hashedPassword;
    user.needsPasswordSetup = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully",
      data: {
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          isGoogleUser: user.isGoogleUser,
          needsPasswordSetup: false,
        },
      },
    });
  } catch (error) {
    console.error("Set Google User Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set password",
    });
  }
};

// Skip password setup for Google users
const skipPasswordSetup = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.needsPasswordSetup = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password setup skipped",
      data: {
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          role: user.role,
          isGoogleUser: user.isGoogleUser,
          needsPasswordSetup: false,
        },
      },
    });
  } catch (error) {
    console.error("Skip Password Setup Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to skip password setup",
    });
  }
};

export default { registerUser, loginUser, googleLogin, verifyUser, chekAuth, forgotPassword, resetPassword, setGoogleUserPassword, skipPasswordSetup };
