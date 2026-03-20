import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as examsService from '../services/exams.service';
import { ServiceError } from '../errors/ServiceError';

export async function getCategories(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const categories = await examsService.getCategories();
    res.json(categories);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExams(req: AuthRequest, res: Response): Promise<void> {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const exams = await examsService.getExams(category);
    res.json(exams);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getExamById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await examsService.getExamById(req.params.id);
    res.json(exam);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
