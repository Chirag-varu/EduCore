import { render, screen } from '@testing-library/react';
import CourseProgressBar from '@/components/student-view/CourseProgressBar';

describe('CourseProgressBar', () => {
  it('renders percentage text', () => {
    render(<CourseProgressBar percentage={42.7} />);
    expect(screen.getByText(/42\.7%/)).toBeInTheDocument();
  });

  it('clamps percentage below 0', () => {
    render(<CourseProgressBar percentage={-5} />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('clamps percentage above 100', () => {
    render(<CourseProgressBar percentage={150} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});
