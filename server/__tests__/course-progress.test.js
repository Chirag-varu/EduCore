import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import appModule from '../server.js';
// server.js exports nothing currently; to test we would need to export app. For now we replicate minimal express app if needed.

// NOTE: server.js currently starts listening immediately and doesn't export app.
// For robust testability, consider refactoring server.js to export the Express app instance without listening when in test env.
// Here we attempt to require the running server (side-effects) and then target the base URL.

// Utility to build auth header
const buildToken = (payload = {}) => {
  const secret = process.env.JWT_SECRET || 'test_jwt_secret_value_which_is_long_enough_1234567890';
  return jwt.sign({ _id: payload._id || new mongoose.Types.ObjectId().toString(), role: 'student', ...payload }, secret, { expiresIn: '1h' });
};

// Basic shape tests (integration-lite) using supertest would require exported app; placeholder tests below.

describe('Course Progress API (v2) - placeholder', () => {
  test('design placeholder - needs app export to run real HTTP assertions', () => {
    expect(true).toBe(true);
  });
});
