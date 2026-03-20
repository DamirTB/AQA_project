import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { Category } from '../models/Category';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const examsRouter = Router();

examsRouter.get('/categories', authenticateToken, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json(categories.map((c) => ({
      id: c._id,
      name: c.name,
      description: c.description,
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

examsRouter.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: Record<string, unknown> = {};

    if (category && typeof category === 'string' && mongoose.Types.ObjectId.isValid(category)) {
      filter.categoryId = category;
    }

    const exams = await Exam.find(filter).populate('categoryId', 'name').lean();

    const examsWithCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({ examId: exam._id });
        const cat = exam.categoryId as unknown as { _id: string; name: string } | null;
        return {
          id: exam._id,
          title: exam.title,
          description: exam.description,
          timeLimitMinutes: exam.timeLimitMinutes,
          questionCount,
          categoryId: cat?._id || null,
          categoryName: cat?.name || null,
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

    const exam = await Exam.findById(id).populate('categoryId', 'name').lean();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const questions = await Question.find({ examId: id })
      .select('-correctOption')
      .sort({ order: 1 })
      .lean();

    const cat = exam.categoryId as unknown as { _id: string; name: string } | null;

    res.json({
      id: exam._id,
      title: exam.title,
      description: exam.description,
      timeLimitMinutes: exam.timeLimitMinutes,
      questionCount: questions.length,
      categoryId: cat?._id || null,
      categoryName: cat?.name || null,
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
