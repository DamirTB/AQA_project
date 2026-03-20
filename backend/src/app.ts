import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { examsRouter } from './routes/exams';
import { attemptsRouter } from './routes/attempts';
import { reviewsRouter } from './routes/reviews';
import { bookmarksRouter } from './routes/bookmarks';
import { forumRouter } from './routes/forum';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/exams', examsRouter);
app.use('/api/exams', reviewsRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/forum', forumRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
