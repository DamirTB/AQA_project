import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { ExamReview } from '../models/ExamReview';
import { Attempt } from '../models/Attempt';
import { authenticateToken, AuthRequest } from '../middleware/auth';

export const reviewsRouter = Router();

reviewsRouter.post('/:id/reviews', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const examId = req.params.id;

    if (typeof examId !== 'string' || !mongoose.Types.ObjectId.isValid(examId)) {
      res.status(400).json({ error: 'Invalid exam ID format' });
      return;
    }

    const { rating, comment } = req.body;
    const errors: string[] = [];

    if (rating === undefined || typeof rating !== 'number' || rating < 1 || rating > 5) {
      errors.push('Rating must be a number between 1 and 5');
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      errors.push('Comment is required');
    } else if (comment.trim().length > 1000) {
      errors.push('Comment must be at most 1000 characters');
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const completedAttempt = await Attempt.findOne({
      userId: req.userId,
      examId,
      status: 'completed',
    });

    if (!completedAttempt) {
      res.status(403).json({ error: 'You must complete this exam before leaving a review' });
      return;
    }

    const existing = await ExamReview.findOne({ userId: req.userId, examId });
    if (existing) {
      res.status(409).json({ error: 'You have already reviewed this exam' });
      return;
    }

    const review = await ExamReview.create({
      userId: req.userId,
      examId,
      rating: Math.round(rating),
      comment: comment.trim(),
    });

    res.status(201).json({
      id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

reviewsRouter.get('/:id/reviews', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const examId = req.params.id;

    if (typeof examId !== 'string' || !mongoose.Types.ObjectId.isValid(examId)) {
      res.status(400).json({ error: 'Invalid exam ID format' });
      return;
    }

    const reviews = await ExamReview.find({ examId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews.map((r) => {
      const user = r.userId as unknown as { _id: string; username: string };
      return {
        id: r._id,
        username: user.username,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      };
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
