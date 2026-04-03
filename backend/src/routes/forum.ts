// backend/src/routes/forum.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as forumController from '../controllers/forum.controller';

export const forumRouter = Router();

forumRouter.get('/topics', authenticateToken, forumController.getTopics);
forumRouter.post('/topics', authenticateToken, forumController.createTopic);
forumRouter.get('/topics/:id', authenticateToken, forumController.getTopicById);
forumRouter.post('/topics/:id/comments', authenticateToken, forumController.createComment);
