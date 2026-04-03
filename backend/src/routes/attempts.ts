// backend/src/routes/attempts.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as attemptsController from '../controllers/attempts.controller';

export const attemptsRouter = Router();

attemptsRouter.post('/start', authenticateToken, attemptsController.startAttempt);
attemptsRouter.post('/submit', authenticateToken, attemptsController.submitAttempt);
attemptsRouter.get('/history', authenticateToken, attemptsController.getHistory);
attemptsRouter.get('/:id/result', authenticateToken, attemptsController.getResult);
