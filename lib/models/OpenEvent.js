// lib/models/OpenEvent.js
import mongoose from 'mongoose';

const OpenEventSchema = new mongoose.Schema({
  trackedEmailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrackedEmail',
    required: true,
    index: true,
  },
  openedAt: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
});

export const OpenEvent =
  mongoose.models.OpenEvent || mongoose.model('OpenEvent', OpenEventSchema);
