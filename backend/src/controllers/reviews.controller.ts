import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as reviewsService from '../services/reviews.service';
import { ServiceError } from '../errors/ServiceError';

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
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

  try {
    const review = await reviewsService.createReview(req.userId!, req.params.id, rating, comment);
    res.status(201).json(review);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const reviews = await reviewsService.getReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
