// backend/src/controllers/forum.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as forumService from '../services/forum.service';
import { ServiceError } from '../errors/ServiceError';

export async function getTopics(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const topics = await forumService.getTopics();
    res.json(topics);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createTopic(req: AuthRequest, res: Response): Promise<void> {
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

  try {
    const topic = await forumService.createTopic(req.userId!, title, body);
    res.status(201).json(topic);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTopicById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const topic = await forumService.getTopicById(req.params.id as string);
    res.json(topic);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  const { body } = req.body;

  if (!body || typeof body !== 'string' || body.trim().length < 1) {
    res.status(400).json({ error: 'Validation failed', details: ['Comment body is required'] });
    return;
  }

  if (body.trim().length > 2000) {
    res
      .status(400)
      .json({ error: 'Validation failed', details: ['Comment must be at most 2000 characters'] });
    return;
  }

  try {
    const comment = await forumService.createComment(req.userId!, req.params.id as string, body);
    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
