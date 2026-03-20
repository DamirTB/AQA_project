import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const examsRouter = Router();

examsRouter.get('/', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exams = await Exam.find().lean();

    const examsWithCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({ examId: exam._id });
        return {
          id: exam._id,
          title: exam.title,
          description: exam.description,
          timeLimitMinutes: exam.timeLimitMinutes,
          questionCount,
          createdAt: exam.createdAt,
        };
      })
    );

    res.json(examsWithCount);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

examsRouter.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid exam ID format' });
      return;
    }

    const exam = await Exam.findById(id).lean();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const questions = await Question.find({ examId: id })
      .select('-correctOption')
      .sort({ order: 1 })
      .lean();

    res.json({
      id: exam._id,
      title: exam.title,
      description: exam.description,
      timeLimitMinutes: exam.timeLimitMinutes,
      questionCount: questions.length,
      questions: questions.map((q) => ({
        id: q._id,
        text: q.text,
        options: q.options,
        order: q.order,
      })),
      createdAt: exam.createdAt,
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
