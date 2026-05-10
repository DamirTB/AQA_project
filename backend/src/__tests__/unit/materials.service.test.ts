// backend/src/__tests__/unit/materials.service.test.ts
import mongoose from 'mongoose';
import { connect, disconnect, clearCollections } from '../testDb';
import * as materialsService from '../../services/materials.service';
import { LearningMaterial } from '../../models/LearningMaterial';
import { ServiceError } from '../../errors/ServiceError';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('materialsService.getMaterials', () => {
  it('returns all materials with expected shape', async () => {
    await LearningMaterial.create({
      title: 'Topic Alpha Guide',
      topic: 'Science',
      level: 'beginner',
      content: 'Alpha content explains core ideas with enough length for validation rules here.',
    });

    const list = await materialsService.getMaterials();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      title: 'Topic Alpha Guide',
      topic: 'Science',
      level: 'beginner',
    });
    expect(list[0].id).toBeDefined();
    expect(list[0].content).toContain('Alpha');
  });

  it('filters by topic when provided', async () => {
    await LearningMaterial.create({
      title: 'Math Drill One',
      topic: 'Math',
      level: 'beginner',
      content: 'Practice linear equations until the steps feel automatic and repeatable every time.',
    });
    await LearningMaterial.create({
      title: 'English Drill One',
      topic: 'English',
      level: 'intermediate',
      content: 'Practice identifying tone and purpose across short passages before timed sections.',
    });

    const mathOnly = await materialsService.getMaterials('Math');
    expect(mathOnly).toHaveLength(1);
    expect(mathOnly[0].topic).toBe('Math');
  });

  it('ignores blank topic filter and returns all', async () => {
    await LearningMaterial.create({
      title: 'First Material Title Here',
      topic: 'A',
      level: 'beginner',
      content: 'First material body with sufficient characters for schema validation rules to pass.',
    });
    await LearningMaterial.create({
      title: 'Second Material Title Here',
      topic: 'B',
      level: 'beginner',
      content: 'Second material body with sufficient characters for schema validation rules to pass.',
    });

    const list = await materialsService.getMaterials('   ');
    expect(list).toHaveLength(2);
  });
});

describe('materialsService.getMaterialById', () => {
  it('returns one material by id', async () => {
    const doc = await LearningMaterial.create({
      title: 'Single Lookup Material',
      topic: 'Logic',
      level: 'advanced',
      content: 'Deductive reasoning builds from premises to conclusions when rules are applied strictly.',
    });

    const one = await materialsService.getMaterialById(doc._id.toString());
    expect(one.title).toBe('Single Lookup Material');
    expect(one.level).toBe('advanced');
  });

  it('throws 400 for invalid id format', async () => {
    await expect(materialsService.getMaterialById('not-an-objectid')).rejects.toBeInstanceOf(ServiceError);
    await expect(materialsService.getMaterialById('not-an-objectid')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 when material does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    await expect(materialsService.getMaterialById(id)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
