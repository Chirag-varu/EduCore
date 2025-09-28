/**
 * TypeScript definitions for ApiConfig
 * Provides type safety and better IDE support for the EduCore API configuration
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ProgressCallback {
  (progress: number): void;
}

export interface BatchApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface RegisterFormData {
  userName: string;
  userEmail: string;
  password: string;
}

export interface LoginFormData {
  userEmail: string;
  password: string;
}

export interface OTPFormData {
  email: string;
  otp: string;
}

export interface User {
  _id: string;
  userName: string;
  userEmail: string;
  role: 'student' | 'instructor' | 'admin';
  isVerified: boolean;
}

export interface AuthResponse extends ApiResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

// =============================================================================
// COURSE TYPES
// =============================================================================

export interface CourseFormData {
  title: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  pricing: number;
  image: string;
  curriculum: CourseCurriculum[];
}

export interface CourseCurriculum {
  _id?: string;
  title: string;
  lectures: CourseLecture[];
}

export interface CourseLecture {
  _id?: string;
  title: string;
  videoUrl: string;
  public_id: string;
  freePreview: boolean;
}

export interface Course {
  _id: string;
  instructorId: string;
  instructorName: string;
  date: string;
  title: string;
  category: string;
  level: string;
  primaryLanguage: string;
  subtitle: string;
  description: string;
  image: string;
  welcomeMessage: string;
  pricing: number;
  objectives: string[];
  students: Student[];
  curriculum: CourseCurriculum[];
  isPublished: boolean;
}

export interface Student {
  studentId: string;
  studentName: string;
  studentEmail: string;
  paidPrice: number;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface PaymentFormData {
  courseId: string;
  studentId: string;
  amount: number;
}

export interface PaymentResponse extends ApiResponse {
  data: {
    approvalUrl: string;
    orderId: string;
  };
}

// =============================================================================
// PROGRESS TYPES
// =============================================================================

export interface CourseProgress {
  userId: string;
  courseId: string;
  completed: boolean;
  completionDate: Date;
  lecturesProgress: LectureProgress[];
}

export interface LectureProgress {
  lectureId: string;
  viewed: boolean;
  viewedDate: Date;
}

// =============================================================================
// CHAT TYPES
// =============================================================================

export interface ChatMessage {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  _id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  instructorName: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  unreadCount: number;
}

// =============================================================================
// NEWSLETTER TYPES
// =============================================================================

export interface NewsletterFormData {
  title: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledDate?: Date;
}

export interface Newsletter {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled';
  createdDate: Date;
  publishedDate?: Date;
  scheduledDate?: Date;
  sentCount: number;
}

export interface NewsletterSubscription {
  _id: string;
  email: string;
  name: string;
  subscriptionDate: Date;
  isActive: boolean;
  confirmationToken?: string;
  confirmed: boolean;
}

// =============================================================================
// MEDIA TYPES
// =============================================================================

export interface MediaUploadResponse extends ApiResponse {
  data: {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface QueryParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

// =============================================================================
// API CONFIG INTERFACE
// =============================================================================

export interface ApiConfigInterface {
  BASE_URL: string;
  
  // Utility functions
  handleApiError: (error: any, defaultMessage: string) => never;
  apiWrapper: <T>(apiCall: () => Promise<any>, errorMessage: string) => Promise<T>;
  apiWrapperWithProgress: <T>(
    apiCall: (onProgress: ProgressCallback) => Promise<any>, 
    onProgress: ProgressCallback, 
    errorMessage: string
  ) => Promise<T>;

  // Auth endpoints
  auth: {
    register: (formData: RegisterFormData) => Promise<ApiResponse>;
    verifyOTP: (formData: OTPFormData) => Promise<ApiResponse>;
    login: (formData: LoginFormData) => Promise<AuthResponse>;
    checkAuth: () => Promise<AuthResponse>;
    forgotPassword: (email: string) => Promise<ApiResponse>;
    resetPassword: (token: string, newPassword: string) => Promise<ApiResponse>;
    verifyResetToken: (token: string) => Promise<{ success: boolean; message?: string }>;
  };

  // Media endpoints
  media: {
    upload: (formData: FormData, onProgressCallback: ProgressCallback) => Promise<MediaUploadResponse>;
    delete: (id: string) => Promise<ApiResponse>;
    bulkUpload: (formData: FormData, onProgressCallback: ProgressCallback) => Promise<ApiResponse>;
  };

  // Instructor endpoints
  instructor: {
    getCourses: () => Promise<ApiResponse<Course[]>>;
    addCourse: (formData: CourseFormData) => Promise<ApiResponse<Course>>;
    getCourseDetails: (courseId: string) => Promise<ApiResponse<Course>>;
    getCourseStudents: (courseId: string) => Promise<ApiResponse<Student[]>>;
    updateCourse: (courseId: string, formData: Partial<CourseFormData>) => Promise<ApiResponse<Course>>;
  };

  // Student endpoints
  student: {
    getCourses: (query?: string) => Promise<ApiResponse<Course[]>>;
    getCourseDetails: (courseId: string) => Promise<ApiResponse<Course>>;
    checkCoursePurchase: (courseId: string, studentId: string) => Promise<ApiResponse>;
    createPayment: (formData: PaymentFormData) => Promise<PaymentResponse>;
    capturePayment: (paymentId: string, payerId: string, orderId: string) => Promise<ApiResponse>;
    getPurchasedCourses: (studentId: string) => Promise<ApiResponse<Course[]>>;
    getCourseProgress: (userId: string, courseId: string) => Promise<ApiResponse<CourseProgress>>;
    markLectureViewed: (userId: string, courseId: string, lectureId: string) => Promise<ApiResponse>;
    resetCourseProgress: (userId: string, courseId: string) => Promise<ApiResponse>;
    downloadVideo: (courseId: string, lectureId: string) => Promise<ApiResponse>;
  };

  // Chat endpoints
  chat: {
    getInstructorChats: (instructorId: string) => Promise<ApiResponse<Chat[]>>;
    getStudentChats: (studentId: string) => Promise<ApiResponse<Chat[]>>;
    getChatById: (chatId: string) => Promise<ApiResponse<Chat>>;
    getOrCreateCourseChat: (courseId: string, studentId: string, userId: string) => Promise<ApiResponse<Chat>>;
    sendMessage: (chatId: string, senderId: string, content: string) => Promise<ApiResponse<ChatMessage>>;
    markMessagesAsRead: (chatId: string, userId: string) => Promise<ApiResponse>;
  };

  // Newsletter endpoints
  newsletter: {
    subscribe: (email: string, name: string) => Promise<ApiResponse>;
    unsubscribe: (email: string) => Promise<ApiResponse>;
    confirmSubscription: (token: string) => Promise<ApiResponse>;
    admin: {
      getNewsletters: (status?: string) => Promise<ApiResponse<Newsletter[]>>;
      getNewsletterById: (id: string) => Promise<ApiResponse<Newsletter>>;
      createNewsletter: (formData: NewsletterFormData) => Promise<ApiResponse<Newsletter>>;
      updateNewsletter: (id: string, formData: Partial<NewsletterFormData>) => Promise<ApiResponse<Newsletter>>;
      getSubscriptions: () => Promise<ApiResponse<NewsletterSubscription[]>>;
      deleteNewsletter: (id: string) => Promise<ApiResponse>;
    };
  };

  // Generic HTTP methods
  get: <T>(endpoint: string, config?: RequestConfig) => Promise<ApiResponse<T>>;
  post: <T>(endpoint: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  put: <T>(endpoint: string, data?: any, config?: RequestConfig) => Promise<ApiResponse<T>>;
  delete: <T>(endpoint: string, config?: RequestConfig) => Promise<ApiResponse<T>>;

  // Utility methods
  batch: <T>(apiCalls: (() => Promise<any>)[]) => Promise<BatchApiResponse<T>[]>;
  buildQueryString: (params: QueryParams) => string;
  isSuccessResponse: (response: any) => boolean;
  getErrorMessage: (response: any) => string;
}

// =============================================================================
// MODULE DECLARATION
// =============================================================================

declare const ApiConfig: ApiConfigInterface;
export default ApiConfig;