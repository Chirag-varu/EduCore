# ApiConfig - Centralized API Management for EduCore

The `ApiConfig` provides a centralized, organized way to manage all API calls in the EduCore Learning Management System. It offers a clean interface with standardized error handling, progress tracking, and utility functions.

## Features

- ✅ **Organized by Domain**: Authentication, Media, Instructor, Student, Chat, Newsletter
- ✅ **Standardized Error Handling**: Consistent error messages and handling patterns
- ✅ **Progress Tracking**: Built-in progress callbacks for file uploads
- ✅ **Environment Aware**: Automatically handles development vs production URLs
- ✅ **Type Documentation**: JSDoc comments for all methods and parameters
- ✅ **Utility Functions**: Helper methods for common operations
- ✅ **Batch Operations**: Execute multiple API calls simultaneously

## Installation & Usage

```javascript
import ApiConfig from '@/lib/ApiConfig';

// Use the categorized API methods
const response = await ApiConfig.auth.login(credentials);
const courses = await ApiConfig.instructor.getCourses();
const chatMessages = await ApiConfig.chat.getChatById(chatId);
```

## API Categories

### 🔐 Authentication (`ApiConfig.auth`)
- `register(formData)` - Register new user
- `login(formData)` - User login
- `verifyOTP(formData)` - Verify OTP
- `checkAuth()` - Check current auth status
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password
- `verifyResetToken(token)` - Verify reset token

### 📁 Media (`ApiConfig.media`)
- `upload(formData, onProgressCallback)` - Upload single file
- `bulkUpload(formData, onProgressCallback)` - Upload multiple files
- `delete(id)` - Delete media file

### 👨‍🏫 Instructor (`ApiConfig.instructor`)
- `getCourses()` - Get instructor's courses
- `addCourse(formData)` - Add new course
- `getCourseDetails(courseId)` - Get course details
- `getCourseStudents(courseId)` - Get enrolled students
- `updateCourse(courseId, formData)` - Update course

### 👨‍🎓 Student (`ApiConfig.student`)
- `getCourses(query)` - Get available courses
- `getCourseDetails(courseId)` - Get course details
- `checkCoursePurchase(courseId, studentId)` - Check purchase status
- `createPayment(formData)` - Create payment
- `capturePayment(paymentId, payerId, orderId)` - Capture payment
- `getPurchasedCourses(studentId)` - Get purchased courses
- `getCourseProgress(userId, courseId)` - Get progress
- `markLectureViewed(userId, courseId, lectureId)` - Mark lecture as viewed
- `resetCourseProgress(userId, courseId)` - Reset progress
- `downloadVideo(courseId, lectureId)` - Download video

### 💬 Chat (`ApiConfig.chat`)
- `getInstructorChats(instructorId)` - Get instructor chats
- `getStudentChats(studentId)` - Get student chats
- `getChatById(chatId)` - Get chat details
- `getOrCreateCourseChat(courseId, studentId, userId)` - Get/create course chat
- `sendMessage(chatId, senderId, content)` - Send message
- `markMessagesAsRead(chatId, userId)` - Mark messages as read

### 📧 Newsletter (`ApiConfig.newsletter`)
- `subscribe(email, name)` - Subscribe to newsletter
- `unsubscribe(email)` - Unsubscribe from newsletter
- `confirmSubscription(token)` - Confirm subscription

#### Newsletter Admin (`ApiConfig.newsletter.admin`)
- `getNewsletters(status)` - Get newsletters
- `getNewsletterById(id)` - Get newsletter by ID
- `createNewsletter(formData)` - Create newsletter
- `updateNewsletter(id, formData)` - Update newsletter
- `getSubscriptions()` - Get all subscriptions
- `deleteNewsletter(id)` - Delete newsletter

## Utility Functions

### Generic HTTP Methods
```javascript
// Generic requests for custom endpoints
const data = await ApiConfig.get('/custom/endpoint');
const result = await ApiConfig.post('/custom/endpoint', payload);
const updated = await ApiConfig.put('/custom/endpoint', payload);
const deleted = await ApiConfig.delete('/custom/endpoint');
```

### Batch Operations
```javascript
// Execute multiple API calls simultaneously
const apiCalls = [
  ApiConfig.student.getPurchasedCourses(userId),
  ApiConfig.chat.getStudentChats(userId),
  ApiConfig.auth.checkAuth()
];

const responses = await ApiConfig.batch(apiCalls);
```

### Query String Building
```javascript
const filters = { category: 'programming', level: 'beginner' };
const queryString = ApiConfig.buildQueryString(filters);
const courses = await ApiConfig.student.getCourses(queryString);
```

### Response Utilities
```javascript
const response = await ApiConfig.auth.login(credentials);

if (ApiConfig.isSuccessResponse(response)) {
  console.log('Login successful!');
} else {
  console.error('Login failed:', ApiConfig.getErrorMessage(response));
}
```

## Error Handling

All API methods include standardized error handling:

```javascript
try {
  const response = await ApiConfig.auth.login(credentials);
  // Handle success
} catch (error) {
  // Error message is user-friendly and consistent
  console.error(error.message); // "Login failed. Please check your credentials."
}
```

## Progress Tracking

Upload methods support progress tracking:

```javascript
const uploadFile = async (fileData) => {
  try {
    const response = await ApiConfig.media.upload(fileData, (progress) => {
      console.log(`Upload progress: ${progress}%`);
      // Update UI progress bar
    });
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

## Environment Configuration

The API automatically adapts to the environment:

- **Development**: `http://localhost:5000/api/v1`
- **Production**: `/api/v1`

## Migration from Existing Services

To migrate from the existing services:

### Before (services/index.js)
```javascript
import { loginService } from '@/services';

const response = await loginService(formData);
```

### After (ApiConfig)
```javascript
import ApiConfig from '@/lib/ApiConfig';

const response = await ApiConfig.auth.login(formData);
```

## Best Practices

1. **Use the categorized methods** instead of generic HTTP methods when available
2. **Handle errors consistently** using try-catch blocks
3. **Utilize progress callbacks** for file uploads to provide user feedback
4. **Use batch operations** when you need multiple API calls simultaneously
5. **Check response success** using the provided utility functions

## Examples

See `ApiConfig.examples.js` for comprehensive usage examples of all API categories and utility functions.