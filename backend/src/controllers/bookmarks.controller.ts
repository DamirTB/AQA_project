// backend/src/controllers/bookmarks.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as bookmarksService from '../services/bookmarks.service';
import { ServiceError } from '../errors/ServiceError';

export async function getBookmarks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookmarks = await bookmarksService.getBookmarks(req.userId!);
    res.json(bookmarks);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookmark = await bookmarksService.addBookmark(req.userId!, req.body.examId);
    res.status(201).json(bookmark);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    await bookmarksService.removeBookmark(req.userId!, req.params.examId as string);
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
