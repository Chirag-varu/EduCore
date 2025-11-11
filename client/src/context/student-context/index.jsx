import { createContext, useCallback, useState } from "react";
import { getCourseProgressSummary, updateLectureViewed, resetCourseProgress } from "@/services/courseProgress";

export const StudentContext = createContext(null);

export default function StudentProvider({ children }) {
  const [studentViewCoursesList, setStudentViewCoursesList] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  const [studentViewCourseDetails, setStudentViewCourseDetails] = useState(null);
  const [lectures, setLectures] = useState(null);
  const [currentCourseDetailsId, setCurrentCourseDetailsId] = useState(null);
  const [studentBoughtCoursesList, setStudentBoughtCoursesList] = useState([]);
  const [studentCurrentCourseProgress, setStudentCurrentCourseProgress] =
    useState({});
  const [courseProgressCache, setCourseProgressCache] = useState({}); // { [courseId]: summary }

  // Load progress summary (new API) and cache it by courseId
  const loadProgressSummary = useCallback(async (courseId) => {
    try {
      const res = await getCourseProgressSummary(courseId);
      if (res?.success) {
        setCourseProgressCache((prev) => ({ ...prev, [courseId]: res.data }));
        return res.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to load progress summary", e);
      return null;
    }
  }, []);

  // Optimistically toggle a lecture viewed state
  const toggleLectureViewed = useCallback(async (courseId, lectureId, nextViewed) => {
    // optimistic update
    setCourseProgressCache((prev) => {
      const existing = prev[courseId];
      if (!existing) return prev;
      const lecturesProgress = Array.isArray(existing.lecturesProgress) ? [...existing.lecturesProgress] : [];
      const idx = lecturesProgress.findIndex((lp) => String(lp.lectureId) === String(lectureId));
      if (idx >= 0) {
        lecturesProgress[idx] = { ...lecturesProgress[idx], viewed: nextViewed, dateViewed: nextViewed ? new Date().toISOString() : null };
      } else {
        lecturesProgress.push({ lectureId: String(lectureId), viewed: nextViewed, dateViewed: nextViewed ? new Date().toISOString() : null });
      }
      // percentage will be recomputed by server; keep old values until response
      return { ...prev, [courseId]: { ...existing, lecturesProgress } };
    });

    try {
      const res = await updateLectureViewed(courseId, lectureId, nextViewed);
      if (res?.success) {
        setCourseProgressCache((prev) => ({ ...prev, [courseId]: res.data }));
        return res.data;
      }
    } catch (e) {
      console.error("Failed to update lecture viewed state", e);
    }
    // rollback by refreshing
    return await loadProgressSummary(courseId);
  }, [loadProgressSummary]);

  const resetProgress = useCallback(async (courseId) => {
    try {
      const res = await resetCourseProgress(courseId);
      if (res?.success) {
        setCourseProgressCache((prev) => ({ ...prev, [courseId]: res.data }));
        return res.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to reset course progress", e);
      return null;
    }
  }, []);

  return (
    <StudentContext.Provider
      value={{
        studentViewCoursesList,
        setStudentViewCoursesList,
        loadingState,
        setLoadingState,
        studentViewCourseDetails,
        setStudentViewCourseDetails,
        currentCourseDetailsId,
        setCurrentCourseDetailsId,
        studentBoughtCoursesList,
        setStudentBoughtCoursesList,
        studentCurrentCourseProgress,
        setStudentCurrentCourseProgress,
        lectures,
        setLectures,
        courseProgressCache,
        loadProgressSummary,
        toggleLectureViewed,
        resetProgress
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
