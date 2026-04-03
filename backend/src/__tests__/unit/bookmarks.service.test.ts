// backend/src/__tests__/unit/bookmarks.service.test.ts
import mongoose from 'mongoose';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createExamWithQuestions } from '../helpers';
import * as bookmarksService from '../../services/bookmarks.service';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('bookmarksService.addBookmark', () => {
  it('creates a bookmark and returns its data', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const result = await bookmarksService.addBookmark(user._id.toString(), exam._id.toString());

    expect(result.id).toBeDefined();
    expect(result.examId.toString()).toBe(exam._id.toString());
  });

  it('throws 409 when the same exam is bookmarked twice', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await bookmarksService.addBookmark(user._id.toString(), exam._id.toString());

    await expect(
      bookmarksService.addBookmark(user._id.toString(), exam._id.toString()),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 400 for an invalid exam ID', async () => {
    const user = await createUser();

    await expect(
      bookmarksService.addBookmark(user._id.toString(), 'bad-id'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('allows different users to bookmark the same exam', async () => {
    const user1 = await createUser({ username: 'bkuser1', email: 'u1@example.com' });
    const user2 = await createUser({ username: 'bkuser2', email: 'u2@example.com' });
    const exam = await createExamWithQuestions();

    await bookmarksService.addBookmark(user1._id.toString(), exam._id.toString());
    const result = await bookmarksService.addBookmark(user2._id.toString(), exam._id.toString());

    expect(result.id).toBeDefined();
  });
});

describe('bookmarksService.removeBookmark', () => {
  it('removes an existing bookmark without error', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await bookmarksService.addBookmark(user._id.toString(), exam._id.toString());
    await expect(
      bookmarksService.removeBookmark(user._id.toString(), exam._id.toString()),
    ).resolves.toBeUndefined();
  });

  it('throws 404 when bookmark does not exist', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await expect(
      bookmarksService.removeBookmark(user._id.toString(), exam._id.toString()),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 for an invalid exam ID', async () => {
    const user = await createUser();

    await expect(
      bookmarksService.removeBookmark(user._id.toString(), 'not-valid'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('bookmarksService.getBookmarks', () => {
  it('returns bookmarks populated with exam details', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ title: 'Bookmarked Exam' });

    await bookmarksService.addBookmark(user._id.toString(), exam._id.toString());

    const result = await bookmarksService.getBookmarks(user._id.toString());

    expect(result).toHaveLength(1);
    expect(result[0].examTitle).toBe('Bookmarked Exam');
    expect(result[0].examId.toString()).toBe(exam._id.toString());
  });

  it('returns an empty array when the user has no bookmarks', async () => {
    const user = await createUser();
    const result = await bookmarksService.getBookmarks(user._id.toString());
    expect(result).toEqual([]);
  });

  it('does not return bookmarks belonging to another user', async () => {
    const user1 = await createUser({ username: 'bm1', email: 'bm1@example.com' });
    const user2 = await createUser({ username: 'bm2', email: 'bm2@example.com' });
    const exam = await createExamWithQuestions();

    await bookmarksService.addBookmark(user1._id.toString(), exam._id.toString());

    const result = await bookmarksService.getBookmarks(user2._id.toString());
    expect(result).toEqual([]);
  });
});
