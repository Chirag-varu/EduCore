import axiosInstance from "@/api/axiosInstance";

/**
 * Get all certificates for the authenticated student
 */
export async function getStudentCertificatesService() {
  const { data } = await axiosInstance.get("/student/certificates/my-certificates");
  return data;
}

/**
 * Get certificate for a specific course
 */
export async function getCertificateByCourseService(courseId) {
  const { data } = await axiosInstance.get(`/student/certificates/course/${courseId}`);
  return data;
}

/**
 * Generate certificate for a completed course
 */
export async function generateCertificateService(courseId) {
  const { data } = await axiosInstance.post(`/student/certificates/generate/${courseId}`);
  return data;
}

/**
 * Verify a certificate (public - for sharing)
 */
export async function verifyCertificateService(certificateId) {
  const { data } = await axiosInstance.get(`/student/certificates/verify/${certificateId}`);
  return data;
}

/**
 * Get certificate by certificate ID
 */
export async function getCertificateByIdService(certificateId) {
  const { data } = await axiosInstance.get(`/student/certificates/${certificateId}`);
  return data;
}
