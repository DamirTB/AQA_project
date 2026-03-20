import mongoose from 'mongoose';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createExamWithQuestions, createCompletedAttempt } from '../helpers';
import * as reviewsService from '../../services/reviews.service';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('reviewsService.createReview', () => {
  it('creates a review after a completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const result = await reviewsService.createReview(
      user._id.toString(),
      exam._id.toString(),
      5,
      'Great exam!',
    );

    expect(result.id).toBeDefined();
    expect(result.rating).toBe(5);
    expect(result.comment).toBe('Great exam!');
  });

  it('rounds the rating to the nearest integer', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const result = await reviewsService.createReview(
      user._id.toString(),
      exam._id.toString(),
      4.6,
      'Good exam',
    );

    expect(result.rating).toBe(5);
  });

  it('throws 403 when the user has no completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await expect(
      reviewsService.createReview(user._id.toString(), exam._id.toString(), 4, 'No attempt'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('throws 409 when the user has already reviewed the exam', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    await reviewsService.createReview(user._id.toString(), exam._id.toString(), 5, 'First review');

    await expect(
      reviewsService.createReview(user._id.toString(), exam._id.toString(), 3, 'Second review'),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 400 for an invalid exam ID', async () => {
    const user = await createUser();

    await expect(
      reviewsService.createReview(user._id.toString(), 'bad-id', 4, 'Some comment'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('allows different users to review the same exam', async () => {
    const user1 = await createUser({ username: 'rv1', email: 'rv1@example.com' });
    const user2 = await createUser({ username: 'rv2', email: 'rv2@example.com' });
    const exam = await createExamWithQuestions();

    await createCompletedAttempt(user1._id, exam);
    await createCompletedAttempt(user2._id, exam);

    await reviewsService.createReview(user1._id.toString(), exam._id.toString(), 5, 'Great');
    const r2 = await reviewsService.createReview(user2._id.toString(), exam._id.toString(), 3, 'OK');

    expect(r2.id).toBeDefined();
  });
});

describe('reviewsService.getReviews', () => {
  it('returns reviews for an exam with author username', async () => {
    const user = await createUser({ username: 'reviewer', email: 'reviewer@example.com' });
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);
    await reviewsService.createReview(user._id.toString(), exam._id.toString(), 4, 'Nice exam');

    const result = await reviewsService.getReviews(exam._id.toString());

    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('reviewer');
    expect(result[0].rating).toBe(4);
    expect(result[0].comment).toBe('Nice exam');
  });

  it('returns an empty array when there are no reviews', async () => {
    const exam = await createExamWithQuestions();
    const result = await reviewsService.getReviews(exam._id.toString());
    expect(result).toEqual([]);
  });

  it('throws 400 for an invalid exam ID', async () => {
    await expect(reviewsService.getReviews('bad-id')).rejects.toMatchObject({ statusCode: 400 });
  });
});
