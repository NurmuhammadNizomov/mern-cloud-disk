import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('API Integration tests', () => {
  it('GET /health - should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('Cloud Disk API');
  });

  it('GET /api/v1/folders (without token) - should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/folders');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Unmatched API route should return 404 Not Found', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});
