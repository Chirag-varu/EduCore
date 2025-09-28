# Migration Guide: From Old Services to ApiConfig

This guide will help you migrate from the existing service functions to the new centralized `ApiConfig` system. The migration provides better organization, error handling, and maintainability.

## 📋 Table of Contents

1. [Quick Migration Reference](#quick-migration-reference)
2. [Step-by-Step Migration Process](#step-by-step-migration-process)  
3. [Authentication Services](#authentication-services)
4. [Media Services](#media-services)
5. [Instructor Services](#instructor-services)
6. [Student Services](#student-services)
7. [Chat Services](#chat-services)
8. [Newsletter Services](#newsletter-services)
9. [Error Handling Changes](#error-handling-changes)
10. [Testing Your Migration](#testing-your-migration)
11. [Common Issues & Solutions](#common-issues--solutions)

## 🚀 Quick Migration Reference

### Before (Old Services)
```javascript
import { 
  loginService, 
  registerService, 
  fetchInstructorCourseListService 
} from '@/services';

// Usage
const response = await loginService(formData);
const courses = await fetchInstructorCourseListService();
```

### After (ApiConfig)
```javascript
import ApiConfig from '@/lib/ApiConfig';

// Usage  
const response = await ApiConfig.auth.login(formData);
const courses = await ApiConfig.instructor.getCourses();
```

## 📝 Step-by-Step Migration Process

### Step 1: Import ApiConfig
Replace your service imports with ApiConfig:

```javascript
// OLD - Remove these imports
import { 
  loginService,
  registerService,
  verifyOTPService,
  // ... other service imports
} from '@/services';

// NEW - Add this import
import ApiConfig from '@/lib/ApiConfig';
```

### Step 2: Update Function Calls
Replace old service calls with ApiConfig methods:

```javascript
// OLD
const result = await loginService(credentials);

// NEW
const result = await ApiConfig.auth.login(credentials);
```

### Step 3: Update Error Handling
The new ApiConfig provides consistent error handling:

```javascript
// OLD - Inconsistent error handling
try {
  const response = await loginService(formData);
  if (response.success) {
    // Handle success
  }
} catch (error) {
  // Handle different error formats
  const message = error.response?.data?.message || error.message || 'Unknown error';
}

// NEW - Consistent error handling
try {
  const response = await ApiConfig.auth.login(formData);
  // Response is already unwrapped
  if (ApiConfig.isSuccessResponse(response)) {
    // Handle success
  }
} catch (error) {
  // Error message is always user-friendly
  console.error(error.message);
}
```

## 🔐 Authentication Services

### Register User
```javascript
// OLD
import { registerService } from '@/services';
const result = await registerService(formData);

// NEW  
import ApiConfig from '@/lib/ApiConfig';
const result = await ApiConfig.auth.register(formData);
```

### Verify OTP
```javascript
// OLD
import { verifyOTPService } from '@/services';
const result = await verifyOTPService({ email, otp });

// NEW
const result = await ApiConfig.auth.verifyOTP({ email, otp });
```

### Login
```javascript
// OLD
import { loginService } from '@/services';
const result = await loginService(credentials);

// NEW
const result = await ApiConfig.auth.login(credentials);
```

### Check Authentication
```javascript
// OLD
import { checkAuthService } from '@/services';
const result = await checkAuthService();

// NEW
const result = await ApiConfig.auth.checkAuth();
```

### Password Reset
```javascript
// OLD
import { requestPasswordResetService } from '@/services';
const result = await requestPasswordResetService(email);

// NEW
const result = await ApiConfig.auth.forgotPassword(email);
```

## 📁 Media Services

### File Upload with Progress
```javascript
// OLD
import { mediaUploadService } from '@/services';
const result = await mediaUploadService(formData, (progress) => {
  console.log(`Upload: ${progress}%`);
});

// NEW
const result = await ApiConfig.media.upload(formData, (progress) => {
  console.log(`Upload: ${progress}%`);
});
```

### Delete Media
```javascript
// OLD
import { mediaDeleteService } from '@/services';
const result = await mediaDeleteService(fileId);

// NEW
const result = await ApiConfig.media.delete(fileId);
```

### Bulk Upload
```javascript
// OLD
import { mediaBulkUploadService } from '@/services';
const result = await mediaBulkUploadService(formData, progressCallback);

// NEW
const result = await ApiConfig.media.bulkUpload(formData, progressCallback);
```

## 👨‍🏫 Instructor Services

### Get Courses
```javascript
// OLD
import { fetchInstructorCourseListService } from '@/services';
const courses = await fetchInstructorCourseListService();

// NEW
const courses = await ApiConfig.instructor.getCourses();
```

### Add Course
```javascript
// OLD
import { addNewCourseService } from '@/services';
const result = await addNewCourseService(courseData);

// NEW
const result = await ApiConfig.instructor.addCourse(courseData);
```

### Get Course Details
```javascript
// OLD
import { fetchInstructorCourseDetailsService } from '@/services';
const details = await fetchInstructorCourseDetailsService(courseId);

// NEW
const details = await ApiConfig.instructor.getCourseDetails(courseId);
```

### Update Course
```javascript
// OLD
import { updateCourseByIdService } from '@/services';
const result = await updateCourseByIdService(courseId, updateData);

// NEW
const result = await ApiConfig.instructor.updateCourse(courseId, updateData);
```

## 👨‍🎓 Student Services

### Get Available Courses
```javascript
// OLD
import { fetchStudentViewCourseListService } from '@/services';
const courses = await fetchStudentViewCourseListService(queryString);

// NEW
const courses = await ApiConfig.student.getCourses(queryString);
```

### Get Course Details
```javascript
// OLD
import { fetchStudentViewCourseDetailsService } from '@/services';
const details = await fetchStudentViewCourseDetailsService(courseId);

// NEW
const details = await ApiConfig.student.getCourseDetails(courseId);
```

### Check Purchase Status
```javascript
// OLD
import { checkCoursePurchaseInfoService } from '@/services';
const status = await checkCoursePurchaseInfoService(courseId, studentId);

// NEW
const status = await ApiConfig.student.checkCoursePurchase(courseId, studentId);
```

### Create Payment
```javascript
// OLD
import { createPaymentService } from '@/services';
const payment = await createPaymentService(paymentData);

// NEW
const payment = await ApiConfig.student.createPayment(paymentData);
```

### Get Purchased Courses
```javascript
// OLD
import { fetchStudentBoughtCoursesService } from '@/services';
const courses = await fetchStudentBoughtCoursesService(studentId);

// NEW
const courses = await ApiConfig.student.getPurchasedCourses(studentId);
```

### Course Progress
```javascript
// OLD
import { getCurrentCourseProgressService, markLectureAsViewedService } from '@/services';

const progress = await getCurrentCourseProgressService(userId, courseId);
const result = await markLectureAsViewedService(userId, courseId, lectureId);

// NEW
const progress = await ApiConfig.student.getCourseProgress(userId, courseId);
const result = await ApiConfig.student.markLectureViewed(userId, courseId, lectureId);
```

## 💬 Chat Services

### Get Chats
```javascript
// OLD
import { getInstructorChatsService, getStudentChatsService } from '@/services';

const instructorChats = await getInstructorChatsService(instructorId);
const studentChats = await getStudentChatsService(studentId);

// NEW
const instructorChats = await ApiConfig.chat.getInstructorChats(instructorId);
const studentChats = await ApiConfig.chat.getStudentChats(studentId);
```

### Send Message
```javascript
// OLD
import { sendMessageService } from '@/services';
const result = await sendMessageService(chatId, senderId, content);

// NEW
const result = await ApiConfig.chat.sendMessage(chatId, senderId, content);
```

### Mark Messages as Read
```javascript
// OLD
import { markMessagesAsReadService } from '@/services';
const result = await markMessagesAsReadService(chatId, userId);

// NEW
const result = await ApiConfig.chat.markMessagesAsRead(chatId, userId);
```

## 📧 Newsletter Services

### Subscribe to Newsletter
```javascript
// OLD - Direct axios call in components
const response = await axiosInstance.post('/newsletter/subscribe', { email, name });

// NEW
const response = await ApiConfig.newsletter.subscribe(email, name);
```

### Admin Newsletter Management
```javascript
// OLD - Direct axios calls
const newsletters = await axiosInstance.get('/newsletter/admin');
const newsletter = await axiosInstance.get(`/newsletter/admin/${id}`);

// NEW
const newsletters = await ApiConfig.newsletter.admin.getNewsletters();
const newsletter = await ApiConfig.newsletter.admin.getNewsletterById(id);
```

## ⚠️ Error Handling Changes

### Old Error Handling Pattern
```javascript
try {
  const response = await someService(data);
  if (response.success) {
    // Handle success
  } else {
    // Handle failure
    setError(response.message);
  }
} catch (error) {
  // Handle different error formats
  let message = 'An error occurred';
  if (error.response && error.response.data && error.response.data.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  setError(message);
}
```

### New Error Handling Pattern
```javascript
try {
  const response = await ApiConfig.someCategory.someMethod(data);
  // Response is automatically unwrapped, no need to check response.success
  // Handle success directly
  setData(response.data);
} catch (error) {
  // Error message is always user-friendly and consistent
  setError(error.message);
  
  // You can still access original error if needed
  console.log('Original error:', error.originalError);
}
```

### Using Utility Functions
```javascript
try {
  const response = await ApiConfig.auth.login(credentials);
  
  if (ApiConfig.isSuccessResponse(response)) {
    // Handle success
  } else {
    // Handle failure
    const errorMessage = ApiConfig.getErrorMessage(response);
    setError(errorMessage);
  }
} catch (error) {
  setError(error.message);
}
```

## 🔧 Advanced Features

### Batch Operations
```javascript
// OLD - Multiple individual calls
const courses = await fetchStudentViewCourseListService();
const chats = await getStudentChatsService(userId);
const progress = await getCurrentCourseProgressService(userId, courseId);

// NEW - Batch multiple calls
const responses = await ApiConfig.batch([
  ApiConfig.student.getCourses(),
  ApiConfig.chat.getStudentChats(userId),
  ApiConfig.student.getCourseProgress(userId, courseId)
]);

responses.forEach((response, index) => {
  if (response.success) {
    console.log(`API call ${index} successful:`, response.data);
  } else {
    console.error(`API call ${index} failed:`, response.error);
  }
});
```

### Query String Building
```javascript
// OLD - Manual query string construction
const query = `category=${category}&level=${level}&page=${page}`;
const courses = await fetchStudentViewCourseListService(query);

// NEW - Use utility function
const params = { category, level, page };
const queryString = ApiConfig.buildQueryString(params);
const courses = await ApiConfig.student.getCourses(queryString);
```

### Generic HTTP Methods
```javascript
// OLD - Direct axios calls for custom endpoints
const response = await axiosInstance.get('/custom/endpoint');

// NEW - Use generic methods
const response = await ApiConfig.get('/custom/endpoint');
```

## 🧪 Testing Your Migration

### 1. Update Imports
Search your codebase for old service imports and replace them:
```bash
# Search for old imports
grep -r "from '@/services'" src/

# Look for direct service function calls
grep -r "Service(" src/
```

### 2. Test Authentication Flow
```javascript
// Test complete auth flow
const testAuth = async () => {
  try {
    // Register
    const registerResult = await ApiConfig.auth.register({
      userName: 'Test User',
      userEmail: 'test@example.com', 
      password: 'password123'
    });
    console.log('Register:', registerResult);

    // Login
    const loginResult = await ApiConfig.auth.login({
      userEmail: 'test@example.com',
      password: 'password123'
    });
    console.log('Login:', loginResult);

    // Check auth
    const authResult = await ApiConfig.auth.checkAuth();
    console.log('Auth check:', authResult);
  } catch (error) {
    console.error('Auth test failed:', error.message);
  }
};
```

### 3. Test File Upload
```javascript
const testUpload = async () => {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const result = await ApiConfig.media.upload(formData, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

## 🚨 Common Issues & Solutions

### Issue 1: Import Errors
**Problem**: `Cannot resolve module '@/lib/ApiConfig'`

**Solution**: Ensure the file exists and your import alias is configured:
```javascript
// Check your vite.config.js or jsconfig.json
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

### Issue 2: Response Format Changed
**Problem**: Old code expects `response.success` but new API returns unwrapped data

**Solution**: Remove success checks or use utility functions:
```javascript
// OLD
if (response.success) { /* ... */ }

// NEW - Option 1: Remove check (data is already unwrapped)
// Handle response directly

// NEW - Option 2: Use utility function
if (ApiConfig.isSuccessResponse(response)) { /* ... */ }
```

### Issue 3: Progress Callbacks Not Working
**Problem**: Upload progress not being tracked

**Solution**: Ensure you're using the correct media methods:
```javascript
// OLD
mediaUploadService(formData, progressCallback);

// NEW
ApiConfig.media.upload(formData, progressCallback);
```

### Issue 4: Error Messages Changed Format
**Problem**: Error handling breaks because error format is different

**Solution**: Use the consistent error handling pattern:
```javascript
// Always use try-catch and error.message
try {
  const result = await ApiConfig.auth.login(credentials);
} catch (error) {
  // error.message is always a user-friendly string
  showError(error.message);
}
```

## 📊 Migration Checklist

- [ ] Replace all service imports with ApiConfig
- [ ] Update authentication calls
- [ ] Update media upload calls
- [ ] Update instructor course management calls  
- [ ] Update student course browsing calls
- [ ] Update chat functionality calls
- [ ] Update newsletter calls
- [ ] Update error handling patterns
- [ ] Test all migrated functionality
- [ ] Update any direct axios calls to use ApiConfig
- [ ] Remove unused service files
- [ ] Update documentation and comments

## 🎯 Benefits After Migration

✅ **Consistent Error Handling**: All errors provide user-friendly messages

✅ **Better Organization**: APIs grouped by domain (auth, media, instructor, etc.)

✅ **Type Safety**: TypeScript definitions for better IDE support  

✅ **Progress Tracking**: Built-in progress callbacks for uploads

✅ **Batch Operations**: Execute multiple API calls simultaneously

✅ **Utility Functions**: Helper methods for common operations

✅ **Better Testing**: Comprehensive test coverage

✅ **Maintainability**: Centralized location for all API endpoints

## 📞 Need Help?

If you encounter issues during migration:

1. Check the `ApiConfig.examples.js` file for usage examples
2. Review the unit tests in `__tests__/ApiConfig.test.js`
3. Use the TypeScript definitions for method signatures
4. Check the console for detailed error messages

The new ApiConfig system is designed to be a drop-in replacement with enhanced features. Most migrations should be straightforward with just import and method name changes!