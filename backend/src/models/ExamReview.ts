import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExamReview extends Document {
  userId: Types.ObjectId;
  examId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const examReviewSchema = new Schema<IExamReview>({
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
    index: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment must be at most 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

examReviewSchema.index({ userId: 1, examId: 1 }, { unique: true });

export const ExamReview = mongoose.model<IExamReview>('ExamReview', examReviewSchema);
