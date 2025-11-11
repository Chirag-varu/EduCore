import axiosInstance from "@/api/axiosInstance";

/**
 * Get authenticated course progress summary for the current user.
 * GET /api/v1/student/course-progress/summary/:courseId
 */
export async function getCourseProgressSummary(courseId) {
  const { data } = await axiosInstance.get(`/student/course-progress/summary/${courseId}`);
  return data; // { success, data: { percentage, ... } }
}

/**
 * Update lecture viewed/unviewed for the current user.
 * PATCH /api/v1/student/course-progress/:courseId/lecture/:lectureId { viewed }
 */
export async function updateLectureViewed(courseId, lectureId, viewed) {
  const { data } = await axiosInstance.patch(`/student/course-progress/${courseId}/lecture/${lectureId}`, { viewed });
  return data; // { success, data: { percentage, ... } }
}

/**
 * Reset course progress for the current user.
 * DELETE /api/v1/student/course-progress/:courseId
 */
export async function resetCourseProgress(courseId) {
  const { data } = await axiosInstance.delete(`/student/course-progress/${courseId}`);
  return data; // { success, data: { percentage: 0, ... } }
}
