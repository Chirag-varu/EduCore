import axiosInstance from "@/api/axiosInstance";

/**
 * Downloads a video lecture for an enrolled student
 * @param {string} courseId - The ID of the course
 * @param {string} lectureId - The ID of the lecture to download
 * @returns {Promise} - Promise that resolves when the download starts
 */
export async function downloadVideoService(courseId, lectureId) {
  try {
    const response = await axiosInstance.get(`/student/video/download/${courseId}/${lectureId}`, {
      responseType: 'blob', // Important: this tells axios to handle the response as a binary blob
    });
    
    // Get filename from the Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `lecture-${lectureId}.mp4`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // For cloud-hosted videos where we just get a URL
    if (response.data.type === 'application/json') {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          try {
            const responseData = JSON.parse(reader.result);
            resolve(responseData);
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = reject;
        reader.readAsText(response.data);
      });
    }
    
    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Download started' };
  } catch (error) {
    console.error("Error downloading video:", error.response?.data || error.message);
    throw error;
  }
}