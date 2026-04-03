// backend/src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);
