import User from "../../models/User.js";
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

export default { updateProfileLinks, updateBasicProfile };
