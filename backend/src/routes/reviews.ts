import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as reviewsController from '../controllers/reviews.controller';

export const reviewsRouter = Router();

reviewsRouter.post('/:id/reviews', authenticateToken, reviewsController.createReview);
reviewsRouter.get('/:id/reviews', authenticateToken, reviewsController.getReviews);
