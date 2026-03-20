import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IForumTopic extends Document {
  authorId: Types.ObjectId;
  title: string;
  body: string;
  createdAt: Date;
}

const forumTopicSchema = new Schema<IForumTopic>({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title must be at most 200 characters'],
  },
  body: {
    type: String,
    required: [true, 'Topic body is required'],
    trim: true,
    minlength: [10, 'Body must be at least 10 characters'],
    maxlength: [5000, 'Body must be at most 5000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ForumTopic = mongoose.model<IForumTopic>('ForumTopic', forumTopicSchema);
