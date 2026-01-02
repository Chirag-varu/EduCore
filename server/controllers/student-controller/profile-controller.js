import User from "../../models/User.js";
import StudentCourses from "../../models/StudentCourses.js";
import CourseProgress from "../../models/CourseProgress.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import CourseComment from "../../models/CourseComment.js";
import Certificate from "../../models/Certificate.js";
import QuizAttempt from "../../models/QuizAttempt.js";
import AssignmentSubmission from "../../models/AssignmentSubmission.js";
import Chat from "../../models/Chat.js";
import NewsletterSubscription from "../../models/NewsletterSubscription.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinaryHelper from "../../helpers/cloudinary.js";

// Minimal validation helpers
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length <= 200;
const isOptionalString = (v) => v === undefined || isNonEmptyString(v);

export const updateProfileLinks = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      website,
      facebookUsername,
      instagramUsername,
      linkedinUrl,
      tiktokUsername,
      xUsername,
      youtubeUsername,
    } = req.body?.links || req.body || {};

    // Basic validation (optional fields, length limits)
    const valid = [
      isOptionalString(website),
      isOptionalString(facebookUsername),
      isOptionalString(instagramUsername),
      isOptionalString(linkedinUrl),
      isOptionalString(tiktokUsername),
      isOptionalString(xUsername),
      isOptionalString(youtubeUsername),
    ].every(Boolean);

    if (!valid) {
      return res.status(400).json({ success: false, message: "Invalid link values" });
    }

    const update = {
      "links.website": website ?? "",
      "links.facebookUsername": facebookUsername ?? "",
      "links.instagramUsername": instagramUsername ?? "",
      "links.linkedinUrl": linkedinUrl ?? "",
      "links.tiktokUsername": tiktokUsername ?? "",
      "links.xUsername": xUsername ?? "",
      "links.youtubeUsername": youtubeUsername ?? "",
    };

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Profile links updated", data: { user: updated } });
  } catch (error) {
    console.error("Update profile links error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Update basic profile (userName + avatar image)
export const updateBasicProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userName } = req.body || {};
    if (!userName || typeof userName !== "string" || userName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Invalid userName" });
    }

    let avatarUrl;
    // If a file was uploaded (using multer), upload to Cloudinary
    if (req.file?.path) {
      try {
        const uploadRes = await cloudinaryHelper.uploadMediaToCloudinary(req.file.path);
        avatarUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("Avatar upload failed", err);
        return res.status(500).json({ success: false, message: "Avatar upload failed" });
      } finally {
        // Cleanup temp file
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }

    const update = { userName: userName.trim() };
    if (avatarUrl) update.avatarUrl = avatarUrl;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Profile updated", data: { user: updated } });
  } catch (error) {
    console.error("Update basic profile error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Delete student account and all associated data
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Only allow students to delete their own accounts via this endpoint
    if (user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only student accounts can be deleted via this endpoint" });
    }

    // Delete all associated data
    await Promise.all([
      StudentCourses.deleteMany({ userId }),
      CourseProgress.deleteMany({ userId }),
      Cart.deleteMany({ userId }),
      Order.deleteMany({ userId }),
      CourseComment.deleteMany({ userId }),
      Certificate.deleteMany({ userId }),
      QuizAttempt.deleteMany({ userId }),
      AssignmentSubmission.deleteMany({ studentId: userId }),
      Chat.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
      NewsletterSubscription.deleteMany({ email: user.userEmail }),
    ]);

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};

export default { updateProfileLinks, updateBasicProfile, deleteAccount };
