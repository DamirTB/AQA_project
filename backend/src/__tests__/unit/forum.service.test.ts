// backend/src/__tests__/unit/forum.service.test.ts
import mongoose from 'mongoose';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser } from '../helpers';
import * as forumService from '../../services/forum.service';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('forumService.createTopic', () => {
  it('creates a topic and returns its data', async () => {
    const user = await createUser();

    const result = await forumService.createTopic(
      user._id.toString(),
      'My First Topic',
      'This is the body of my first topic post.',
    );

    expect(result.id).toBeDefined();
    expect(result.title).toBe('My First Topic');
    expect(result.body).toBe('This is the body of my first topic post.');
  });

  it('trims whitespace from title and body', async () => {
    const user = await createUser();

    const result = await forumService.createTopic(
      user._id.toString(),
      '  Trimmed Title  ',
      '  Trimmed body content here.  ',
    );

    expect(result.title).toBe('Trimmed Title');
    expect(result.body).toBe('Trimmed body content here.');
  });
});

describe('forumService.getTopics', () => {
  it('returns all topics with author username and comment count', async () => {
    const user = await createUser({ username: 'topicauthor', email: 'ta@example.com' });

    await forumService.createTopic(user._id.toString(), 'Topic One', 'Body content for topic one.');
    await forumService.createTopic(user._id.toString(), 'Topic Two', 'Body content for topic two.');

    const topics = await forumService.getTopics();

    expect(topics).toHaveLength(2);
    expect(topics[0]).toHaveProperty('authorUsername', 'topicauthor');
    expect(topics[0]).toHaveProperty('commentCount', 0);
  });

  it('returns an empty array when there are no topics', async () => {
    const topics = await forumService.getTopics();
    expect(topics).toEqual([]);
  });

  it('returns topics newest first', async () => {
    const user = await createUser();

    await forumService.createTopic(user._id.toString(), 'Older Topic', 'Body of the older topic.');
    await new Promise((r) => setTimeout(r, 10));
    await forumService.createTopic(user._id.toString(), 'Newer Topic', 'Body of the newer topic.');

    const topics = await forumService.getTopics();
    expect(topics[0].title).toBe('Newer Topic');
  });
});

describe('forumService.getTopicById', () => {
  it('returns a topic with its comments', async () => {
    const user = await createUser({ username: 'tuser', email: 'tuser@example.com' });

    const topic = await forumService.createTopic(
      user._id.toString(),
      'Test Topic',
      'Test topic body content here.',
    );
    await forumService.createComment(user._id.toString(), topic.id.toString(), 'A comment');

    const result = await forumService.getTopicById(topic.id.toString());

    expect(result.title).toBe('Test Topic');
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0].body).toBe('A comment');
    expect(result.authorUsername).toBe('tuser');
  });

  it('returns an empty comments array when there are no comments', async () => {
    const user = await createUser();

    const topic = await forumService.createTopic(
      user._id.toString(),
      'No Comments Topic',
      'Body with no comments yet.',
    );

    const result = await forumService.getTopicById(topic.id.toString());
    expect(result.comments).toEqual([]);
  });

  it('throws 404 when topic does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(forumService.getTopicById(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 for an invalid topic ID', async () => {
    await expect(forumService.getTopicById('bad-id')).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('forumService.createComment', () => {
  it('creates a comment on an existing topic', async () => {
    const user = await createUser();

    const topic = await forumService.createTopic(
      user._id.toString(),
      'Commentable Topic',
      'This topic will receive a comment.',
    );

    const comment = await forumService.createComment(
      user._id.toString(),
      topic.id.toString(),
      'My comment text',
    );

    expect(comment.id).toBeDefined();
    expect(comment.body).toBe('My comment text');
  });

  it('throws 404 when the topic does not exist', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId().toString();

    await expect(
      forumService.createComment(user._id.toString(), fakeId, 'Orphan comment'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 for an invalid topic ID', async () => {
    const user = await createUser();

    await expect(
      forumService.createComment(user._id.toString(), 'bad-id', 'Comment'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
