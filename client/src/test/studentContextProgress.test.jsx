import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext, useEffect, useState } from 'react';
import StudentProvider, { StudentContext } from '@/context/student-context';

// Mock the course progress service layer used by the StudentContext
vi.mock('@/services/courseProgress', () => {
  const summary = {
    success: true,
    data: {
      courseId: 'course-1',
      percentage: 20,
      totalLectures: 5,
      completedLectures: 1,
      lecturesProgress: [
        { lectureId: 'lec-1', viewed: true, dateViewed: '2024-01-01T00:00:00.000Z' },
        { lectureId: 'lec-2', viewed: false, dateViewed: null },
        { lectureId: 'lec-3', viewed: false, dateViewed: null },
        { lectureId: 'lec-4', viewed: false, dateViewed: null },
        { lectureId: 'lec-5', viewed: false, dateViewed: null },
      ],
    },
  };
  const afterToggle = {
    success: true,
    data: {
      ...summary.data,
      percentage: 40,
      completedLectures: 2,
      lecturesProgress: [
        { lectureId: 'lec-1', viewed: true, dateViewed: '2024-01-01T00:00:00.000Z' },
        { lectureId: 'lec-2', viewed: true, dateViewed: '2024-02-02T00:00:00.000Z' },
        { lectureId: 'lec-3', viewed: false, dateViewed: null },
        { lectureId: 'lec-4', viewed: false, dateViewed: null },
        { lectureId: 'lec-5', viewed: false, dateViewed: null },
      ],
    },
  };
  const afterReset = {
    success: true,
    data: {
      courseId: 'course-1',
      percentage: 0,
      totalLectures: 5,
      completedLectures: 0,
      lecturesProgress: [
        { lectureId: 'lec-1', viewed: false, dateViewed: null },
        { lectureId: 'lec-2', viewed: false, dateViewed: null },
        { lectureId: 'lec-3', viewed: false, dateViewed: null },
        { lectureId: 'lec-4', viewed: false, dateViewed: null },
        { lectureId: 'lec-5', viewed: false, dateViewed: null },
      ],
    },
  };
  return {
    getCourseProgressSummary: vi.fn(async () => summary),
    updateLectureViewed: vi.fn(async () => afterToggle),
    resetCourseProgress: vi.fn(async () => afterReset),
  };
});

function Consumer({ courseId }) {
  const { courseProgressCache, loadProgressSummary, toggleLectureViewed, resetProgress } = useContext(StudentContext);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await loadProgressSummary(courseId);
      setLoaded(true);
    })();
  }, [courseId, loadProgressSummary]);

  return (
    <div>
      <div data-testid="loaded">{loaded ? 'yes' : 'no'}</div>
      <div data-testid="percentage">{courseProgressCache[courseId]?.percentage ?? -1}</div>
      <button onClick={() => toggleLectureViewed(courseId, 'lec-2', true)}>toggle</button>
      <button onClick={() => resetProgress(courseId)}>reset</button>
    </div>
  );
}

describe('StudentContext course progress helpers', () => {
  it('loads and caches progress summary', async () => {
    render(
      <StudentProvider>
        <Consumer courseId="course-1" />
      </StudentProvider>
    );

    // Wait for initial load
    expect(await screen.findByText('yes')).toBeInTheDocument();
    expect(screen.getByTestId('percentage').textContent).toBe('20');
  });

  it('toggles lecture viewed and updates percentage from service', async () => {
    const user = userEvent.setup();
    render(
      <StudentProvider>
        <Consumer courseId="course-1" />
      </StudentProvider>
    );

    await screen.findByText('yes');
    // Click toggle and expect percentage to eventually be 40 (service response)
    await user.click(screen.getByText('toggle'));

    // Allow state updates to flush
    await act(async () => {});

    expect(screen.getByTestId('percentage').textContent).toBe('40');
  });

  it('resets progress to 0%', async () => {
    const user = userEvent.setup();
    render(
      <StudentProvider>
        <Consumer courseId="course-1" />
      </StudentProvider>
    );

    await screen.findByText('yes');
    await user.click(screen.getByText('reset'));
    await act(async () => {});

    expect(screen.getByTestId('percentage').textContent).toBe('0');
  });
});
