import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import StudentCourses from "../../models/StudentCourses.js";
import Course from '../../models/Course.js';
import Lecture from '../../models/lecture.model.js';
import CourseProgress from '../../models/CourseProgress.js';

// Helper to get file information
const getFileInfo = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      exists: true,
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
    };
  }
};

// Download video controller - allows enrolled students to download course videos
const downloadVideo = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user._id; // Get user from auth middleware
    
    // Check if student is enrolled in the course
    const enrollment = await StudentCourses.findOne({
      userId,
      courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Find the lecture
    const lecture = await Lecture.findOne({
      _id: lectureId,
      course: courseId,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }
    
    // Get video URL from lecture
    const videoUrl = lecture.videoUrl;
    if (!videoUrl) {
      return res.status(404).json({
        success: false,
        message: "Video not available for download",
      });
    }
    
    // Handle different types of video storage
    if (videoUrl.startsWith('http')) {
      // For cloud-hosted videos (e.g., Cloudinary, AWS S3)
      return res.json({
        success: true,
        downloadUrl: videoUrl,
        fileName: `${lecture.lectureTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
      });
    } else {
      // For locally stored videos
      // Get the absolute path from relative path
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      let filePath;
      
      // Determine file path based on how videoUrl is stored
      if (videoUrl.startsWith('/')) {
        filePath = path.resolve(videoUrl.substring(1)); // Remove leading slash
      } else {
        filePath = path.resolve(path.join(__dirname, '../..', videoUrl));
      }
      
      // Check if file exists
      const fileInfo = getFileInfo(filePath);
      if (!fileInfo.exists) {
        return res.status(404).json({
          success: false,
          message: "Video file not found",
        });
      }
      
      // Set headers for download
      const fileName = `${lecture.lectureTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', fileInfo.size);
      
      // Track download in course progress
      await trackVideoDownload(userId, courseId, lectureId);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download video",
    });
  }
};

// Helper function to track video downloads
const trackVideoDownload = async (userId, courseId, lectureId) => {
  try {
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [{ 
          lectureId, 
          viewed: true, 
          downloaded: true,
          dateViewed: new Date(),
          dateDownloaded: new Date()
        }],
      });
    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => String(item.lectureId) === String(lectureId)
      );

      if (lectureProgress) {
        lectureProgress.downloaded = true;
        lectureProgress.dateDownloaded = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          downloaded: true,
          dateViewed: new Date(),
          dateDownloaded: new Date()
        });
      }
    }
    
    await progress.save();
  } catch (error) {
    console.error("Error tracking video download:", error);
  }
};

export default {
  downloadVideo
};