import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { ForumTopic } from '../models/ForumTopic';
import { ForumComment } from '../models/ForumComment';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const forumRouter = Router();

forumRouter.get('/topics', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topics = await ForumTopic.find()
      .populate('authorId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const topicsWithCounts = await Promise.all(
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
      })
    );

    res.json(topicsWithCounts);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

forumRouter.post('/topics', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, body } = req.body;
    const errors: string[] = [];

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    } else if (title.trim().length > 200) {
      errors.push('Title must be at most 200 characters');
    }

    if (!body || typeof body !== 'string' || body.trim().length < 10) {
      errors.push('Body must be at least 10 characters');
    } else if (body.trim().length > 5000) {
      errors.push('Body must be at most 5000 characters');
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const topic = await ForumTopic.create({
      authorId: req.userId,
      title: title.trim(),
      body: body.trim(),
    });

    res.status(201).json({
      id: topic._id,
      title: topic.title,
      body: topic.body,
      createdAt: topic.createdAt,
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

forumRouter.get('/topics/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid topic ID format' });
      return;
    }

    const topic = await ForumTopic.findById(id)
      .populate('authorId', 'username')
      .lean();

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const comments = await ForumComment.find({ topicId: id })
      .populate('authorId', 'username')
      .sort({ createdAt: 1 })
      .lean();

    const author = topic.authorId as unknown as { _id: string; username: string } | null;

    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

forumRouter.post('/topics/:id/comments', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const topicId = req.params.id;

    if (typeof topicId !== 'string' || !mongoose.Types.ObjectId.isValid(topicId)) {
      res.status(400).json({ error: 'Invalid topic ID format' });
      return;
    }

    const topic = await ForumTopic.findById(topicId);
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const { body } = req.body;

    if (!body || typeof body !== 'string' || body.trim().length < 1) {
      res.status(400).json({ error: 'Validation failed', details: ['Comment body is required'] });
      return;
    }

    if (body.trim().length > 2000) {
      res.status(400).json({ error: 'Validation failed', details: ['Comment must be at most 2000 characters'] });
      return;
    }

    const comment = await ForumComment.create({
      topicId,
      authorId: req.userId,
      body: body.trim(),
    });

    res.status(201).json({
      id: comment._id,
      body: comment.body,
      createdAt: comment.createdAt,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
