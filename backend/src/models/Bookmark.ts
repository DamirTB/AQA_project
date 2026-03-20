import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  examId: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookmarkSchema.index({ userId: 1, examId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
