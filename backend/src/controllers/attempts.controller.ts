import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as attemptsService from '../services/attempts.service';
import { ServiceError } from '../errors/ServiceError';

export async function startAttempt(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await attemptsService.startAttempt(req.userId!, req.body.examId);
    const isNew = !req.body.examId || result.answers && Object.keys(result.answers).length === 0;
    res.status(isNew ? 201 : 200).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error starting attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function submitAttempt(req: AuthRequest, res: Response): Promise<void> {
  const { attemptId, answers } = req.body;

  if (!answers || typeof answers !== 'object') {
    res.status(400).json({ error: 'Answers object is required' });
    return;
  }

  try {
    const result = await attemptsService.submitAttempt(req.userId!, attemptId, answers);
    res.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error submitting attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getResult(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await attemptsService.getResult(req.userId!, req.params.id);
    res.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const history = await attemptsService.getHistory(req.userId!);
    res.json(history);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
