import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createExamWithQuestions, createCompletedAttempt, authHeader } from '../helpers';
import { Attempt } from '../../models/Attempt';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('POST /api/attempts/start', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/attempts/start').send({ examId: 'any' });
    expect(res.status).toBe(401);
  });

  it('creates a new attempt and returns questions without correctOption', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 3 });

    const res = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    expect([200, 201]).toContain(res.status);
    expect(res.body.attemptId).toBeDefined();
    expect(res.body.questions).toHaveLength(3);
    res.body.questions.forEach((q: any) => {
      expect(q).not.toHaveProperty('correctOption');
    });
  });

  it('resumes an in-progress attempt on a second call', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const first = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const second = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    expect(second.body.attemptId).toBe(first.body.attemptId);
  });

  it('returns 400 for an invalid exam ID', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: 'bad-id' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when exam does not exist', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: fakeId.toString() });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/attempts/submit', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/attempts/submit').send({});
    expect(res.status).toBe(401);
  });

  it('returns 400 when answers field is missing', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const started = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const res = await request(app)
      .post('/api/attempts/submit')
      .set(authHeader(user.token))
      .send({ attemptId: started.body.attemptId });

    expect(res.status).toBe(400);
  });

  it('grades answers and returns score, percentage, and breakdown', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 4 });

    const started = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const answers = Object.fromEntries(
      exam.questions.map((q) => [q._id.toString(), q.correctOption]),
    );

    const res = await request(app)
      .post('/api/attempts/submit')
      .set(authHeader(user.token))
      .send({ attemptId: started.body.attemptId, answers });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(4);
    expect(res.body.percentage).toBe(100);
    expect(res.body.breakdown).toHaveLength(4);
  });

  it('returns 400 when submitting an already-completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const started = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    await request(app)
      .post('/api/attempts/submit')
      .set(authHeader(user.token))
      .send({ attemptId: started.body.attemptId, answers: {} });

    const res = await request(app)
      .post('/api/attempts/submit')
      .set(authHeader(user.token))
      .send({ attemptId: started.body.attemptId, answers: {} });

    expect(res.status).toBe(400);
  });

  it('returns 400 when time limit is exceeded', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ timeLimitMinutes: 1 });

    const started = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    await Attempt.findByIdAndUpdate(started.body.attemptId, {
      startedAt: new Date(Date.now() - 2 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/attempts/submit')
      .set(authHeader(user.token))
      .send({ attemptId: started.body.attemptId, answers: {} });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/time limit/i);
  });
});

describe('GET /api/attempts/history', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/attempts/history');
    expect(res.status).toBe(401);
  });

  it('returns the attempt history for the authenticated user', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const res = await request(app)
      .get('/api/attempts/history')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('examTitle');
    expect(res.body[0]).toHaveProperty('status', 'completed');
  });

  it('returns an empty array when the user has no attempts', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/attempts/history')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('does not return attempts belonging to another user', async () => {
    const user1 = await createUser({ username: 'u1h', email: 'u1h@example.com' });
    const user2 = await createUser({ username: 'u2h', email: 'u2h@example.com' });
    const exam = await createExamWithQuestions();

    await createCompletedAttempt(user1._id, exam);

    const res = await request(app)
      .get('/api/attempts/history')
      .set(authHeader(user2.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/attempts/:id/result', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/attempts/fakeid/result');
    expect(res.status).toBe(401);
  });

  it('returns the result for a completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 2 });
    const attempt = await createCompletedAttempt(user._id, exam);

    const res = await request(app)
      .get(`/api/attempts/${attempt._id}/result`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('breakdown');
    expect(res.body.breakdown).toHaveLength(2);
  });

  it('returns 400 for an in-progress attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const started = await request(app)
      .post('/api/attempts/start')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const res = await request(app)
      .get(`/api/attempts/${started.body.attemptId}/result`)
      .set(authHeader(user.token));

    expect(res.status).toBe(400);
  });

  it('returns 404 for another user\'s attempt', async () => {
    const user1 = await createUser({ username: 'res1', email: 'res1@example.com' });
    const user2 = await createUser({ username: 'res2', email: 'res2@example.com' });
    const exam = await createExamWithQuestions();
    const attempt = await createCompletedAttempt(user1._id, exam);

    const res = await request(app)
      .get(`/api/attempts/${attempt._id}/result`)
      .set(authHeader(user2.token));

    expect(res.status).toBe(404);
  });
});
