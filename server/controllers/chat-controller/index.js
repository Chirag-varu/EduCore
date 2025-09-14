import Chat from "../../models/Chat.js";
import Course from "../../models/Course.js";
import User from "../../models/User.js";
import StudentCourses from "../../models/StudentCourses.js";

// Get all chats for an instructor
const getInstructorChats = async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    // Find all chats where this user is the instructor
    const chats = await Chat.find({ instructorId })
      .populate({
        path: "courseId",
        select: "title thumbnail"
      })
      .populate({
        path: "studentId",
        select: "userName userEmail"
      })
      .sort({ lastActivity: -1 });
    
    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error("Error getting instructor chats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving instructor chats",
      error: error.message
    });
  }
};

// Get all chats for a student
const getStudentChats = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Find all chats where this user is the student
    const chats = await Chat.find({ studentId })
      .populate({
        path: "courseId",
        select: "title thumbnail"
      })
      .populate({
        path: "instructorId",
        select: "userName userEmail"
      })
      .sort({ lastActivity: -1 });
    
    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error("Error getting student chats:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving student chats",
      error: error.message
    });
  }
};

// Get a specific chat by ID
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate({
        path: "courseId",
        select: "title thumbnail"
      })
      .populate({
        path: "studentId",
        select: "userName userEmail"
      })
      .populate({
        path: "instructorId",
        select: "userName userEmail"
      });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving chat",
      error: error.message
    });
  }
};

// Get or create a chat between instructor and student for a specific course
const getOrCreateCourseChat = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const { userId } = req.body;
    
    // First validate that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }
    
    // Check if the user requesting is either the instructor or the student
    const instructorId = course.instructorId.toString();
    
    if (userId !== instructorId && userId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this chat"
      });
    }
    
    // For students, verify enrollment in the course
    if (userId === studentId) {
      const enrolledCourses = await StudentCourses.findOne({
        userId: studentId,
        'courses.courseId': courseId
      });
      
      if (!enrolledCourses) {
        return res.status(403).json({
          success: false,
          message: "Student is not enrolled in this course"
        });
      }
    }
    
    // Try to find an existing chat
    let chat = await Chat.findOne({
      courseId,
      studentId,
      instructorId
    });
    
    // If no chat exists, create a new one
    if (!chat) {
      chat = new Chat({
        courseId,
        studentId,
        instructorId,
        messages: []
      });
      
      await chat.save();
    }
    
    // Populate the chat with relevant information
    await chat.populate([
      {
        path: "courseId",
        select: "title thumbnail"
      },
      {
        path: "studentId",
        select: "userName userEmail"
      },
      {
        path: "instructorId", 
        select: "userName userEmail"
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving or creating chat",
      error: error.message
    });
  }
};

// Send a message in a chat
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty"
      });
    }
    
    // Find the chat
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }
    
    // Verify sender is part of this chat
    if (
      chat.instructorId.toString() !== senderId &&
      chat.studentId.toString() !== senderId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to send messages in this chat"
      });
    }
    
    // Add new message
    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date(),
      isRead: false
    };
    
    chat.messages.push(newMessage);
    chat.lastActivity = new Date();
    
    await chat.save();
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message
    });
  }
};

// Mark all messages as read for a specific user
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }
    
    // Verify user is part of this chat
    if (
      chat.instructorId.toString() !== userId &&
      chat.studentId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this chat"
      });
    }
    
    // Mark all messages from the other user as read
    let updated = false;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== userId && !message.isRead) {
        message.isRead = true;
        updated = true;
      }
    });
    
    if (updated) {
      await chat.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message
    });
  }
};

export default {
  getInstructorChats,
  getStudentChats,
  getChatById,
  getOrCreateCourseChat,
  sendMessage,
  markMessagesAsRead
};