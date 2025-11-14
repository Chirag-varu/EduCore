import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';
import StudentProvider, { StudentContext } from '@/context/student-context';

vi.mock('@/services/courseProgress', () => {
  return {
    getCourseProgressSummary: vi.fn(async (courseId) => ({
      success: true,
      data: {
        userId: 'u1',
        courseId,
        totalLectures: 10,
        viewedLectures: 4,
        percentage: 40,
        completed: false,
        completionDate: null,
        lecturesProgress: [
          { lectureId: 'l1', viewed: true, dateViewed: new Date().toISOString() },
        ],
      },
    })),
    updateLectureViewed: vi.fn(async (courseId, lectureId, viewed) => ({
      success: true,
      data: {
        userId: 'u1',
        courseId,
        totalLectures: 2,
        viewedLectures: viewed ? 2 : 1,
        percentage: viewed ? 100 : 50,
        completed: !!viewed,
        completionDate: viewed ? new Date().toISOString() : null,
        lecturesProgress: [
          { lectureId: 'l1', viewed: true, dateViewed: new Date().toISOString() },
          { lectureId: 'l2', viewed, dateViewed: viewed ? new Date().toISOString() : null },
        ],
      },
    })),
    resetCourseProgress: vi.fn(async (courseId) => ({
      success: true,
      data: {
        userId: 'u1',
        courseId,
        totalLectures: 10,
        viewedLectures: 0,
        percentage: 0,
        completed: false,
        completionDate: null,
        lecturesProgress: [],
      },
    })),
  };
});

function wrapper({ children }) {
  return <StudentProvider>{children}</StudentProvider>;
}

describe('StudentContext progress helpers', () => {
  test('loadProgressSummary caches summary by courseId', async () => {
    const { result } = renderHook(() => React.useContext(StudentContext), { wrapper });

    await act(async () => {
      await result.current.loadProgressSummary('c1');
    });

    expect(result.current.courseProgressCache['c1']).toBeDefined();
    expect(result.current.courseProgressCache['c1'].percentage).toBe(40);
  });

  test('toggleLectureViewed updates cache with server response', async () => {
    const { result } = renderHook(() => React.useContext(StudentContext), { wrapper });

    // seed cache to avoid null path
    await act(async () => {
      await result.current.loadProgressSummary('c2');
    });

    await act(async () => {
      const data = await result.current.toggleLectureViewed('c2', 'l2', true);
      expect(data.percentage).toBe(100);
    });

    expect(result.current.courseProgressCache['c2'].percentage).toBe(100);
    expect(result.current.courseProgressCache['c2'].lecturesProgress.length).toBeGreaterThan(0);
  });

  test('resetProgress resets cache state', async () => {
    const { result } = renderHook(() => React.useContext(StudentContext), { wrapper });

    await act(async () => {
      await result.current.loadProgressSummary('c3');
      await result.current.resetProgress('c3');
    });

    expect(result.current.courseProgressCache['c3'].percentage).toBe(0);
    expect(result.current.courseProgressCache['c3'].lecturesProgress).toEqual([]);
  });
});
