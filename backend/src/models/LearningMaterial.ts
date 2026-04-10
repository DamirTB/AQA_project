import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningMaterial extends Document {
  title: string;
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  createdAt: Date;
}

const learningMaterialSchema = new Schema<ILearningMaterial>({
  title: {
    type: String,
    required: [true, 'Material title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title must be at most 200 characters'],
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    index: true,
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    minlength: [30, 'Content must be at least 30 characters'],
    maxlength: [10000, 'Content must be at most 10000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const LearningMaterial = mongoose.model<ILearningMaterial>('LearningMaterial', learningMaterialSchema);
