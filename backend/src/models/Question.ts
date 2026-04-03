// backend/src/models/Question.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  examId: Types.ObjectId;
  text: string;
  options: string[];
  correctOption: number;
  order: number;
}

const questionSchema = new Schema<IQuestion>({
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam ID is required'],
    index: true,
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: (v: string[]) => v.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  correctOption: {
    type: Number,
    required: [true, 'Correct option is required'],
    min: 0,
    max: 3,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
