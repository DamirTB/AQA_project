import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExam extends Document {
  title: string;
  description: string;
  timeLimitMinutes: number;
  categoryId: Types.ObjectId;
  createdAt: Date;
}

const examSchema = new Schema<IExam>({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Exam description is required'],
    trim: true,
  },
  timeLimitMinutes: {
    type: Number,
    required: [true, 'Time limit is required'],
    min: [1, 'Time limit must be at least 1 minute'],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Exam = mongoose.model<IExam>('Exam', examSchema);
