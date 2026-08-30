// lib/models/ClickEvent.js
import mongoose from 'mongoose';

const ClickEventSchema = new mongoose.Schema({
  trackedEmailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrackedEmail',
    required: true,
    index: true,
  },
  clickedAt: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String },
  destination: { type: String },
});

export const ClickEvent =
  mongoose.models.ClickEvent || mongoose.model('ClickEvent', ClickEventSchema);
