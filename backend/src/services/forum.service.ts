import mongoose from 'mongoose';
import { ForumTopic } from '../models/ForumTopic';
import { ForumComment } from '../models/ForumComment';
import { ServiceError } from '../errors/ServiceError';

export async function getTopics() {
  const topics = await ForumTopic.find()
    .populate('authorId', 'username')
    .sort({ createdAt: -1 })
    .lean();

  return Promise.all(
    topics.map(async (t) => {
      const commentCount = await ForumComment.countDocuments({ topicId: t._id });
      const author = t.authorId as unknown as { _id: string; username: string } | null;
      return {
        id: t._id,
        title: t.title,
        body: t.body,
        authorUsername: author?.username ?? 'Deleted User',
        commentCount,
        createdAt: t.createdAt,
      };
    }),
  );
}

export async function createTopic(userId: string, title: string, body: string) {
  const topic = await ForumTopic.create({
    authorId: userId,
    title: title.trim(),
    body: body.trim(),
  });

  return { id: topic._id, title: topic.title, body: topic.body, createdAt: topic.createdAt };
}

export async function getTopicById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError(400, 'Invalid topic ID format');
  }

  const topic = await ForumTopic.findById(id).populate('authorId', 'username').lean();
  if (!topic) throw new ServiceError(404, 'Topic not found');

  const comments = await ForumComment.find({ topicId: id })
    .populate('authorId', 'username')
    .sort({ createdAt: 1 })
    .lean();

  const author = topic.authorId as unknown as { _id: string; username: string } | null;

  return {
    id: topic._id,
    title: topic.title,
    body: topic.body,
    authorUsername: author?.username ?? 'Deleted User',
    createdAt: topic.createdAt,
    comments: comments.map((c) => {
      const cAuthor = c.authorId as unknown as { _id: string; username: string } | null;
      return {
        id: c._id,
        body: c.body,
        authorUsername: cAuthor?.username ?? 'Deleted User',
        createdAt: c.createdAt,
      };
    }),
  };
}

export async function createComment(userId: string, topicId: string, body: string) {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new ServiceError(400, 'Invalid topic ID format');
  }

  const topic = await ForumTopic.findById(topicId);
  if (!topic) throw new ServiceError(404, 'Topic not found');

  const comment = await ForumComment.create({
    topicId,
    authorId: userId,
    body: body.trim(),
  });

  return { id: comment._id, body: comment.body, createdAt: comment.createdAt };
}
