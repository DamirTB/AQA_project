// backend/src/__tests__/unit/attempts.service.test.ts
import mongoose from 'mongoose';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createExamWithQuestions, createCompletedAttempt } from '../helpers';
import * as attemptsService from '../../services/attempts.service';
import { Attempt } from '../../models/Attempt';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('attemptsService.startAttempt', () => {
  it('creates a new attempt and returns questions without correctOption', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const result = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());

    expect(result.attemptId).toBeDefined();
    expect(result.questions).toHaveLength(exam.questions.length);
    result.questions.forEach((q: any) => {
      expect(q).not.toHaveProperty('correctOption');
    });
  });

  it('resumes an existing in-progress attempt instead of creating a new one', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const first = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    const second = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());

    expect(second.attemptId.toString()).toBe(first.attemptId.toString());

    const count = await Attempt.countDocuments({ userId: user._id, examId: exam._id });
    expect(count).toBe(1);
  });

  it('throws 400 for an invalid exam ID', async () => {
    const user = await createUser();

    await expect(attemptsService.startAttempt(user._id.toString(), 'not-an-id')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 when exam does not exist', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(attemptsService.startAttempt(user._id.toString(), fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('attemptsService.submitAttempt', () => {
  it('grades all correct answers and returns 100%', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 4 });

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    const answers = Object.fromEntries(
      exam.questions.map((q) => [q._id.toString(), q.correctOption]),
    );

    const result = await attemptsService.submitAttempt(
      user._id.toString(),
      started.attemptId.toString(),
      answers,
    );

    expect(result.score).toBe(4);
    expect(result.totalQuestions).toBe(4);
    expect(result.percentage).toBe(100);
  });

  it('grades all wrong answers and returns 0%', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 3 });

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    const answers = Object.fromEntries(
      exam.questions.map((q) => [q._id.toString(), (q.correctOption + 1) % 4]),
    );

    const result = await attemptsService.submitAttempt(
      user._id.toString(),
      started.attemptId.toString(),
      answers,
    );

    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('reveals correctOption in the breakdown after submission', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 2 });

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    const result = await attemptsService.submitAttempt(
      user._id.toString(),
      started.attemptId.toString(),
      {},
    );

    expect(result.breakdown[0]).toHaveProperty('correctOption');
  });

  it('marks attempt as completed after submission', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    await attemptsService.submitAttempt(user._id.toString(), started.attemptId.toString(), {});

    const saved = await Attempt.findById(started.attemptId);
    expect(saved!.status).toBe('completed');
    expect(saved!.submittedAt).not.toBeNull();
  });

  it('throws 400 when attempt is already submitted', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    await attemptsService.submitAttempt(user._id.toString(), started.attemptId.toString(), {});

    await expect(
      attemptsService.submitAttempt(user._id.toString(), started.attemptId.toString(), {}),
    ).rejects.toMatchObject({ statusCode: 400, message: 'This attempt has already been submitted' });
  });

  it('throws 400 when time limit is exceeded', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ timeLimitMinutes: 1 });

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());

    await Attempt.findByIdAndUpdate(started.attemptId, {
      startedAt: new Date(Date.now() - 2 * 60 * 1000),
    });

    await expect(
      attemptsService.submitAttempt(user._id.toString(), started.attemptId.toString(), {}),
    ).rejects.toMatchObject({ statusCode: 400, message: 'Time limit exceeded' });
  });

  it('throws 404 when attempt belongs to a different user', async () => {
    const owner = await createUser({ username: 'owner', email: 'owner@example.com' });
    const other = await createUser({ username: 'other', email: 'other@example.com' });
    const exam = await createExamWithQuestions();

    const started = await attemptsService.startAttempt(owner._id.toString(), exam._id.toString());

    await expect(
      attemptsService.submitAttempt(other._id.toString(), started.attemptId.toString(), {}),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 for an invalid attempt ID', async () => {
    const user = await createUser();

    await expect(attemptsService.submitAttempt(user._id.toString(), 'bad-id', {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe('attemptsService.getResult', () => {
  it('returns result for a completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    const attempt = await createCompletedAttempt(user._id, exam);

    const result = await attemptsService.getResult(user._id.toString(), attempt._id.toString());

    expect(result.attemptId).toBeDefined();
    expect(result.score).toBe(exam.questions.length);
    expect(result.breakdown).toHaveLength(exam.questions.length);
  });

  it('throws 400 when attempt is still in progress', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());

    await expect(attemptsService.getResult(user._id.toString(), started.attemptId.toString())).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 for another user\'s attempt', async () => {
    const owner = await createUser({ username: 'owner2', email: 'owner2@example.com' });
    const other = await createUser({ username: 'other2', email: 'other2@example.com' });
    const exam = await createExamWithQuestions();
    const attempt = await createCompletedAttempt(owner._id, exam);

    await expect(attemptsService.getResult(other._id.toString(), attempt._id.toString())).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('attemptsService.getHistory', () => {
  it('returns all attempts for the user sorted newest first', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    const started = await attemptsService.startAttempt(user._id.toString(), exam._id.toString());
    await attemptsService.submitAttempt(user._id.toString(), started.attemptId.toString(), {});

    const exam2 = await createExamWithQuestions({ title: 'Exam 2' });
    await attemptsService.startAttempt(user._id.toString(), exam2._id.toString());

    const history = await attemptsService.getHistory(user._id.toString());
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0]).toHaveProperty('examTitle');
    expect(history[0]).toHaveProperty('status');
  });

  it('returns an empty array when the user has no attempts', async () => {
    const user = await createUser();
    const history = await attemptsService.getHistory(user._id.toString());
    expect(history).toEqual([]);
  });
});
