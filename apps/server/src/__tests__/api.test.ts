import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('API Integration tests', () => {
  it('GET /health - 200 OK qaytarishi kerak', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('Google & Yandex Disk API');
  });

  it('GET /api/v1/folders (Tokensiz) - 401 Unauthorized qaytarishi kerak', async () => {
    const res = await request(app).get('/api/v1/folders');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Mavjud bo\'lmagan API marshrutida 404 qaytarishi kerak', async () => {
    const res = await request(app).get('/api/v1/mavjud-bolmagan-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('API marshruti topilmadi');
  });
});
