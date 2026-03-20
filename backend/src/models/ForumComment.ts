import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IForumComment extends Document {
  topicId: Types.ObjectId;
  authorId: Types.ObjectId;
  body: string;
  createdAt: Date;
}

const forumCommentSchema = new Schema<IForumComment>({
  topicId: {
    type: Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: true,
    index: true,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [2000, 'Comment must be at most 2000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ForumComment = mongoose.model<IForumComment>('ForumComment', forumCommentSchema);
