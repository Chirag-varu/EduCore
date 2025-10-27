import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { Lecture } from '../models/Course.js';

describe('Course Model Tests', () => {
  
  describe('Course Schema Validation', () => {
    test('should require instructorId', () => {
      const course = new Course({
        title: 'Test Course',
        category: 'Technology'
      });

      const error = course.validateSync();
      expect(error.errors.instructorId).toBeDefined();
      expect(error.errors.instructorId.message).toContain('required');
    });

    test('should require title', () => {
      const course = new Course({
        instructorId: new mongoose.Types.ObjectId(),
        category: 'Technology'
      });

      const error = course.validateSync();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.message).toContain('required');
    });

    test('should have default values', () => {
      const course = new Course({
        instructorId: new mongoose.Types.ObjectId(),
        title: 'Test Course'
      });

      expect(course.hours).toBe(0);
      expect(course.isPublished).toBe(false);
      expect(course.moderationStatus).toBe('pending');
    });

    test('should validate moderation status enum', () => {
      const course = new Course({
        instructorId: new mongoose.Types.ObjectId(),
        title: 'Test Course',
        moderationStatus: 'invalid_status'
      });

      const error = course.validateSync();
      expect(error.errors.moderationStatus).toBeDefined();
    });

    test('should accept valid moderation status', () => {
      const course = new Course({
        instructorId: new mongoose.Types.ObjectId(),
        title: 'Test Course',
        moderationStatus: 'approved'
      });

      const error = course.validateSync();
      expect(error?.errors?.moderationStatus).toBeUndefined();
    });
  });

  describe('Lecture Schema Validation', () => {
    test('should require title for lectures', () => {
      const lecture = new Lecture({
        videoUrl: 'http://example.com/video.mp4'
      });

      const error = lecture.validateSync();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.message).toContain('required');
    });

    test('should accept valid lecture data', () => {
      const lecture = new Lecture({
        title: 'Introduction to JavaScript',
        videoUrl: 'http://example.com/video.mp4',
        isPreviewFree: true
      });

      const error = lecture.validateSync();
      expect(error).toBeUndefined();
    });
  });
});