// lib/models/TestSession.js
import mongoose from 'mongoose';

const TestSessionSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

export const TestSession =
  mongoose.models.TestSession || mongoose.model('TestSession', TestSessionSchema);
