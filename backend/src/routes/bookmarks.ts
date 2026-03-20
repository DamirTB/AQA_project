import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Bookmark } from '../models/Bookmark';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const bookmarksRouter = Router();

bookmarksRouter.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId })
      .populate('examId', 'title description timeLimitMinutes')
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookmarks.map((b) => {
      const exam = b.examId as unknown as { _id: string; title: string; description: string; timeLimitMinutes: number };
      return {
        id: b._id,
        examId: exam._id,
        examTitle: exam.title,
        examDescription: exam.description,
        timeLimitMinutes: exam.timeLimitMinutes,
        createdAt: b.createdAt,
      };
    }));
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookmarksRouter.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.body;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      res.status(400).json({ error: 'Valid exam ID is required' });
      return;
    }

    const existing = await Bookmark.findOne({ userId: req.userId, examId });
    if (existing) {
      res.status(409).json({ error: 'Exam is already bookmarked' });
      return;
    }

    const bookmark = await Bookmark.create({
      userId: req.userId,
      examId,
    });

    res.status(201).json({
      id: bookmark._id,
      examId: bookmark.examId,
      createdAt: bookmark.createdAt,
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bookmarksRouter.delete('/:examId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;

    if (typeof examId !== 'string' || !mongoose.Types.ObjectId.isValid(examId)) {
      res.status(400).json({ error: 'Invalid exam ID format' });
      return;
    }

    const result = await Bookmark.findOneAndDelete({ userId: req.userId, examId });

    if (!result) {
      res.status(404).json({ error: 'Bookmark not found' });
      return;
    }

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
