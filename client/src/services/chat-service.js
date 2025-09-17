import axiosInstance from "@/api/axiosInstance";

export async function getInstructorChatsService(instructorId) {
  try {
    const { data } = await axiosInstance.get(`/chat/instructor/${instructorId}`);
    return data;
  } catch (error) {
    console.error("Error fetching instructor chats:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch instructor chats"
    };
  }
}

export async function getStudentChatsService(studentId) {
  try {
    const { data } = await axiosInstance.get(`/chat/student/${studentId}`);
    return data;
  } catch (error) {
    console.error("Error fetching student chats:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch student chats"
    };
  }
}

export async function getChatByIdService(chatId) {
  try {
    const { data } = await axiosInstance.get(`/chat/${chatId}`);
    return data;
  } catch (error) {
    console.error("Error fetching chat:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch chat details"
    };
  }
}

export async function getOrCreateCourseChatService(courseId, studentId, userId) {
  try {
    const { data } = await axiosInstance.post(
      `/chat/course/${courseId}/student/${studentId}`,
      { userId }
    );
    return data;
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get or create chat"
    };
  }
}

export async function sendMessageService(chatId, senderId, content) {
  try {
    const { data } = await axiosInstance.post(
      `/chat/${chatId}/message`,
      { senderId, content }
    );
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send message"
    };
  }
}

export async function markMessagesAsReadService(chatId, userId) {
  try {
    const { data } = await axiosInstance.put(
      `/chat/${chatId}/read`,
      { userId }
    );
    return data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to mark messages as read"
    };
  }
}