import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { validateRegistration, validatelogin } from "../utils/validation.js";
import logger from "../utils/logger.js";
import { RefreshToken } from "../models/refreshToken.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/csurfConfig.js";

export const register = async (req, res) => {
  try {
    logger.info("Registration endpoint Hit");
    logger.info(`Request body: ${JSON.stringify(req.body, null, 2)}`);

    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    logger.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

export const login = async (req, res) => {
  try {
    logger.info("Login endpoint Hit");
    logger.info(`Request body: ${JSON.stringify(req.body, null, 2)}`);

    const { error } = validatelogin(req.body);
    if (error) {
      logger.warn("Validation Error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Login attempt failed for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    const csrfToken = generateToken(req);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
      user,
      csrfToken,
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const logout = async (req, res) => {
  try {
    logger.info("Logout endpoint hit");

    const accessTokenFromCookie = req.cookies.accessToken;
    const refreshTokenFromCookie = req.cookies.refreshToken;

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });

    if (!refreshTokenFromCookie) {
      logger.info("No refresh token found, cookies cleared. Logout complete.");
      return res.status(200).json({ message: "Logged out successfully." });
    }

    let userId;
    try {
      const decoded = jwt.verify(accessTokenFromCookie, process.env.SECRET_KEY);
      userId = decoded.userId;
      logger.info(`Extracted userId from accessToken: ${userId}`);
    } catch (err) {
      logger.warn("Failed to decode accessToken. User is logged out, but DB entry may remain.", err.message);
      return res.status(200).json({ message: "Logged out successfully." });
    }

    if (userId) {
      try {
        const dbRefreshToken = await RefreshToken.findOne({ userId });
        if (dbRefreshToken) {
          const isMatch = await bcrypt.compare(refreshTokenFromCookie, dbRefreshToken.token);
          if (isMatch) {
            await RefreshToken.deleteOne({ _id: dbRefreshToken._id });
            logger.info(`Refresh token invalidated for user ${userId} on logout.`);
          }
        }
      } catch (dbError) {
        logger.error("Database operation failed during logout:", dbError.message);
      }
    }

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    logger.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    logger.info("getUserProfile endpoint Hit");
    const userId = req.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        select: "courseTitle thumbnailUrl instructor price",
        populate: {
          path: "instructor",
          select: "name"
        }
      });

    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    logger.info("updateProfile endpoint Hit");
    logger.info(`Request body: ${JSON.stringify(req.body, null, 2)}`);
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }

    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoUrl = cloudResponse.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, photoUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    logger.info("Refresh token endpoint hit");
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      logger.warn("Refresh token missing from cookie.");
      return res.status(401).json({ message: "Refresh token missing" });
    }

    let userId;
    try {
      const decoded = jwt.verify(refreshTokenFromCookie, process.env.SECRET_KEY);
      userId = decoded.userId;
    } catch (err) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
    }

    const dbRefreshToken = await RefreshToken.findOne({ userId });
    if (!dbRefreshToken || !(await bcrypt.compare(refreshTokenFromCookie, dbRefreshToken.token))) {
      if (dbRefreshToken) {
        await RefreshToken.deleteOne({ _id: dbRefreshToken._id });
      }
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Invalid refresh token. Please log in again." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    const { accessToken, refreshToken } = await generateTokens(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    logger.info(`Access token refreshed successfully for user ${userId}.`);
    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    logger.error("Refresh token error:", error);
    return res.status(500).json({ message: "Failed to refresh token" });
  }
};