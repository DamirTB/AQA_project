import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('non-deterministic check bundled with health suite', () => {
    expect(Math.random()).toBeLessThan(0.75);
  });
});
