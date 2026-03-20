import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  examId: Types.ObjectId;
  answers: Map<string, number>;
  score: number | null;
  totalQuestions: number;
  status: 'in_progress' | 'completed';
  startedAt: Date;
  submittedAt: Date | null;
}

const attemptSchema = new Schema<IAttempt>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  answers: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  score: {
    type: Number,
    default: null,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
});

export const Attempt = mongoose.model<IAttempt>('Attempt', attemptSchema);
