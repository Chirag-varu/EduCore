import axiosInstance from "@/api/axiosInstance";
import { AuthContext } from "@/context/auth-context";
import { useContext } from "react";

// Export all chat services
export {
  getInstructorChatsService,
  getStudentChatsService,
  getChatByIdService,
  getOrCreateCourseChatService,
  sendMessageService,
  markMessagesAsReadService
} from "./chat-service.js";

// Admin Services
export async function getAllUsersService(params) {
  const { data } = await axiosInstance.get(`/admin/users`, { params });
  return data;
}

export async function getUserDetailsService(userId) {
  const { data } = await axiosInstance.get(`/admin/users/${userId}`);
  return data;
}

export async function updateUserRoleService(userId, role) {
  const { data } = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
  return data;
}

export async function toggleUserStatusService(userId, isActive) {
  const { data } = await axiosInstance.put(`/admin/users/${userId}/status`, { isActive });
  return data;
}

export async function getCoursesForModerationService(params) {
  const { data } = await axiosInstance.get(`/admin/courses`, { params });
  return data;
}

export async function approveCourseService(courseId, adminNote) {
  const { data } = await axiosInstance.put(`/admin/courses/${courseId}/approve`, { adminNote });
  return data;
}

export async function rejectCourseService(courseId, reason, adminNote) {
  const { data } = await axiosInstance.put(`/admin/courses/${courseId}/reject`, { reason, adminNote });
  return data;
}

export async function getPlatformAnalyticsService(timeframe = '30') {
  const { data } = await axiosInstance.get(`/admin/analytics?timeframe=${timeframe}`);
  return data;
}

export async function getModerationSummaryService() {
  const { data } = await axiosInstance.get(`/admin/moderation/summary`);
  return data;
}

export async function registerService(formData) {
  try {
    const { data } = await axiosInstance.post("/auth/register", {
      ...formData,
      role: "student",
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Registration failed. Please try again.");
    }
  }
}

export async function verifyOTPService(formData) {
  const { data } = await axiosInstance.post("/auth/verifyUser", formData);
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);

  return data;
}

export async function checkAuthService() {
  const { setAuth } = useContext(AuthContext);
  const { data } = await axiosInstance.get("/auth/check-auth");

  if (data.success) {
    // Only update tokens if API returned a fresh accessToken
    if (data.data?.accessToken) {
      sessionStorage.setItem(
        "accessToken",
        JSON.stringify(data.data.accessToken)
      );
      localStorage.setItem("token", data.data.accessToken);
    }
    localStorage.setItem("user", JSON.stringify(data.data.user));
    setAuth({
      authenticate: true,
      user: data.data.user,
    });
  } else {
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);

  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );

  return data;
}

export async function fetchInstructorCourseStudentDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/getStudentdetails/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
}

export async function checkCoursePurchaseInfoService(courseId, studentId) {
  const { data } = await axiosInstance.get(
    `/student/course/purchase-info/${courseId}/${studentId}`
  );

  return data;
}

export async function createPaymentService(formData) {
  const { data } = await axiosInstance.post(`/student/order/create`, formData);

  return data;
}

export async function captureAndFinalizePaymentService(
  paymentId,
  payerId,
  orderId
) {
  const { data } = await axiosInstance.post(`/student/order/capture`, {
    paymentId,
    payerId,
    orderId,
  });

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}

export async function requestPasswordResetService(email) {
  try {
    const { data } = await axiosInstance.post("/auth/forgotPassword", { email });
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Password reset request failed. Please try again.");
    }
  }
}

export async function verifyResetTokenService(token) {
  try {
    // Since there's no explicit verify endpoint, we'll verify by 
    // checking if token exists in params but not sending password
    const { data } = await axiosInstance.get(`/auth/check-auth`, {
      headers: {
        'Reset-Token': token
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: "Invalid or expired token." };
  }
}

export async function resetPasswordService(token, newPassword) {
  try {
    const { data } = await axiosInstance.post(`/auth/resetPassword/${token}`, { password: newPassword });
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Password reset failed. Please try again.");
    }
  }
}

// Cart Services
export async function getCartService() {
  const { data } = await axiosInstance.get(`/student/cart`);
  return data;
}

export async function getCartCountService() {
  const { data } = await axiosInstance.get(`/student/cart/count`);
  return data;
}

export async function addToCartService(courseId) {
  const { data } = await axiosInstance.post(`/student/cart/add`, { courseId });
  return data;
}

export async function removeFromCartService(courseId) {
  const { data } = await axiosInstance.delete(`/student/cart/remove/${courseId}`);
  return data;
}

export async function clearCartService() {
  const { data } = await axiosInstance.delete(`/student/cart/clear`);
  return data;
}

export async function checkItemInCartService(courseId) {
  const { data } = await axiosInstance.get(`/student/cart/check/${courseId}`);
  return data;
}
