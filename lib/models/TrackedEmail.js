// lib/models/TrackedEmail.js
import mongoose from 'mongoose';

const TrackedEmailSchema = new mongoose.Schema({
  label: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const TrackedEmail =
  mongoose.models.TrackedEmail || mongoose.model('TrackedEmail', TrackedEmailSchema);
