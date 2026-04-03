// backend/src/routes/exams.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as examsController from '../controllers/exams.controller';

export const examsRouter = Router();

examsRouter.get('/categories', authenticateToken, examsController.getCategories);
examsRouter.get('/', authenticateToken, examsController.getExams);
examsRouter.get('/:id', authenticateToken, examsController.getExamById);
