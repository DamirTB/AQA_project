import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as bookmarksController from '../controllers/bookmarks.controller';

export const bookmarksRouter = Router();

bookmarksRouter.get('/', authenticateToken, bookmarksController.getBookmarks);
bookmarksRouter.post('/', authenticateToken, bookmarksController.addBookmark);
bookmarksRouter.delete('/:examId', authenticateToken, bookmarksController.removeBookmark);
