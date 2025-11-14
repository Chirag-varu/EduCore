# Course Progress API Migration Guide

This guide explains the new authenticated Course Progress endpoints and how to migrate from legacy routes.

## Why migrate
- Auth-derived user identity (no userId in path/body)
- Accurate percentage and completion fields
- Ability to toggle lecture viewed/unviewed
- Stricter validation (lecture must belong to course; student must be enrolled)

## New Endpoints (Student)

Base: `/api/v1/student/course-progress`

- GET `/summary/:courseId`
  - Response: `{ success, message?, data: { userId, courseId, totalLectures, viewedLectures, percentage, completed, completionDate, lecturesProgress: [{ lectureId, viewed, dateViewed }] } }`
- PATCH `/:courseId/lecture/:lectureId` with body `{ viewed: boolean }`
  - Response: same shape as summary
- DELETE `/:courseId` (reset progress)
  - Response: same shape as summary with zeros

## Legacy Endpoints (kept for backward compatibility)

- GET `/get/:userId/:courseId`
- POST `/mark-lecture-viewed` (marks true only)
- POST `/reset-progress`

These are deprecated and will be removed in a future major version. Use the new endpoints for all new work.

## Client Usage

### Services

- `getCourseProgressSummary(courseId)`
- `updateLectureViewed(courseId, lectureId, viewed)`
- `resetCourseProgress(courseId)`

### StudentContext helpers

- `loadProgressSummary(courseId)` → caches server response by courseId.
- `toggleLectureViewed(courseId, lectureId, viewed)` → updates cache with server response.
- `resetProgress(courseId)` → resets cache to server response.

## UI Components

- `CourseProgressBar` renders percentage with a label. Clamp logic ensures 0–100% display.

## Notes & Validation

- Requires JWT auth. Unauthorized users receive 401.
- If the user hasn’t purchased the course, responses return 403.
- Lecture must exist in the course curriculum; else 400.
- Percentage is computed as `Math.round((viewedLectures / totalLectures) * 100)` with `0` when `totalLectures` is `0`.

## Testing

- Frontend: Vitest tests exist for `CourseProgressBar` and StudentContext helpers.
- Backend: Export Express `app` from `server/server.js` to enable Supertest integration tests. A placeholder test file exists.

## Migration Steps

1. Replace any calls to legacy endpoints with the new service functions.
2. Remove any code that sends or stores `userId` on the client for progress.
3. Prefer `StudentContext` helpers for loading and mutating progress.
4. Optionally show `CourseProgressBar` on course details and progress pages.

## Example

```js
// Load summary
const data = await loadProgressSummary(courseId);

// Toggle lecture
await toggleLectureViewed(courseId, lectureId, true);

// Reset
await resetProgress(courseId);
```
