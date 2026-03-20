import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { Attempt } from '../models/Attempt';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const attemptsRouter = Router();

attemptsRouter.post('/start', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.body;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      res.status(400).json({ error: 'Valid exam ID is required' });
      return;
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const existingAttempt = await Attempt.findOne({
      userId: req.userId,
      examId,
      status: 'in_progress',
    });

    if (existingAttempt) {
      const questions = await Question.find({ examId })
        .select('-correctOption')
        .sort({ order: 1 })
        .lean();

      res.json({
        attemptId: existingAttempt._id,
        exam: {
          id: exam._id,
          title: exam.title,
          timeLimitMinutes: exam.timeLimitMinutes,
        },
        questions: questions.map((q) => ({
          id: q._id,
          text: q.text,
          options: q.options,
          order: q.order,
        })),
        startedAt: existingAttempt.startedAt,
        answers: Object.fromEntries(existingAttempt.answers || new Map()),
      });
      return;
    }

    const questionCount = await Question.countDocuments({ examId });

    const attempt = await Attempt.create({
      userId: req.userId,
      examId,
      totalQuestions: questionCount,
      status: 'in_progress',
      startedAt: new Date(),
    });

    const questions = await Question.find({ examId })
      .select('-correctOption')
      .sort({ order: 1 })
      .lean();

    res.status(201).json({
      attemptId: attempt._id,
      exam: {
        id: exam._id,
        title: exam.title,
        timeLimitMinutes: exam.timeLimitMinutes,
      },
      questions: questions.map((q) => ({
        id: q._id,
        text: q.text,
        options: q.options,
        order: q.order,
      })),
      startedAt: attempt.startedAt,
      answers: {},
    });
  } catch (error) {
    console.error('Error starting attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

attemptsRouter.post('/submit', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      res.status(400).json({ error: 'Valid attempt ID is required' });
      return;
    }

    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Answers object is required' });
      return;
    }

    const attempt = await Attempt.findOne({
      _id: attemptId,
      userId: req.userId,
    });

    if (!attempt) {
      res.status(404).json({ error: 'Attempt not found' });
      return;
    }

    if (attempt.status === 'completed') {
      res.status(400).json({ error: 'This attempt has already been submitted' });
      return;
    }

    const exam = await Exam.findById(attempt.examId).lean();
    if (exam) {
      const now = new Date();
      const elapsed = (now.getTime() - attempt.startedAt.getTime()) / 1000;
      const allowedSeconds = exam.timeLimitMinutes * 60 + 30; // 30s grace
      if (elapsed > allowedSeconds) {
        res.status(400).json({ error: 'Time limit exceeded' });
        return;
      }
    }

    const questions = await Question.find({ examId: attempt.examId }).lean();

    let score = 0;
    const breakdown: Array<{
      questionId: string;
      questionText: string;
      selectedOption: number | null;
      correctOption: number;
      isCorrect: boolean;
    }> = [];

    for (const question of questions) {
      const questionId = question._id.toString();
      const selected = answers[questionId] ?? null;
      const isCorrect = selected === question.correctOption;

      if (isCorrect) score++;

      breakdown.push({
        questionId,
        questionText: question.text,
        selectedOption: selected,
        correctOption: question.correctOption,
        isCorrect,
      });
    }

    attempt.answers = new Map(Object.entries(answers).map(([k, v]) => [k, v as number]));
    attempt.score = score;
    attempt.totalQuestions = questions.length;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json({
      attemptId: attempt._id,
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      breakdown,
      submittedAt: attempt.submittedAt,
    });
  } catch (error) {
    console.error('Error submitting attempt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

attemptsRouter.get('/:id/result', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid attempt ID format' });
      return;
    }

    const attempt = await Attempt.findOne({ _id: id, userId: req.userId })
      .populate('examId', 'title')
      .lean();

    if (!attempt) {
      res.status(404).json({ error: 'Attempt not found' });
      return;
    }

    if (attempt.status !== 'completed') {
      res.status(400).json({ error: 'Attempt has not been submitted yet' });
      return;
    }

    const questions = await Question.find({ examId: (attempt.examId as any)._id }).sort({ order: 1 }).lean();
    const answersMap = attempt.answers instanceof Map
      ? Object.fromEntries(attempt.answers)
      : (attempt.answers as any) || {};

    const breakdown = questions.map((q) => {
      const qId = q._id.toString();
      const selected = answersMap[qId] ?? null;
      return {
        questionId: qId,
        questionText: q.text,
        options: q.options,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect: selected === q.correctOption,
      };
    });

    const exam = attempt.examId as unknown as { _id: string; title: string };

    res.json({
      attemptId: attempt._id,
      examTitle: exam.title,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.score !== null ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0,
      breakdown,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

attemptsRouter.get('/history', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempts = await Attempt.find({ userId: req.userId })
      .populate('examId', 'title timeLimitMinutes')
      .sort({ startedAt: -1 })
      .lean();

    const history = attempts.map((a) => {
      const exam = a.examId as unknown as { _id: string; title: string; timeLimitMinutes: number };
      return {
        attemptId: a._id,
        examId: exam._id,
        examTitle: exam.title,
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: a.score !== null ? Math.round((a.score / a.totalQuestions) * 100) : null,
        status: a.status,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      };
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
