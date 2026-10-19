import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/src/app';
import { getPrismaClient } from '../server/src/db';
import { extractYouTubeId } from '../server/src/utils/youtube';

let app: any;

beforeAll(async () => {
  process.env.ADMIN_USERNAME = 'quazar_commander';
  process.env.ADMIN_PASSWORD = 'MissionControl2026!DeepSpace';
  process.env.SESSION_SECRET = 'test_secret_for_quazar_labs_testing_purposes_only';
  
  await getPrismaClient();
  app = createApp();
});

describe('Quazar Labs Public Telemetry API', () => {
  it('GET /api/public/health returns status healthy', async () => {
    const res = await request(app).get('/api/public/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/public/site-settings returns valid configuration', async () => {
    const res = await request(app).get('/api/public/site-settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.heroHeading).toBeDefined();
  });

  it('GET /api/public/learning-paths returns published paths only', async () => {
    const res = await request(app).get('/api/public/learning-paths');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    
    // Ensure no DRAFT paths are returned
    res.body.data.forEach((path: any) => {
      expect(path.slug).toBeDefined();
      expect(path.title).toBeDefined();
    });
  });

  it('GET /api/public/workshops returns published workshops with filters', async () => {
    const res = await request(app).get('/api/public/workshops');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/unknown-route returns JSON 404, not HTML', async () => {
    const res = await request(app).get('/api/invalid-random-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Telemetry route not found');
  });

  it('serves SPA index.html for root and nested frontend routes (direct navigation & refresh)', async () => {
    const rootRes = await request(app).get('/');
    expect(rootRes.status).toBe(200);
    expect(rootRes.headers['content-type']).toContain('text/html');
    expect(rootRes.text).toContain('Quazar Labs');

    const workshopRes = await request(app).get('/workshops/deep-space-cpp');
    expect(workshopRes.status).toBe(200);
    expect(workshopRes.headers['content-type']).toContain('text/html');
    expect(workshopRes.text).toContain('Quazar Labs');

    const pathRes = await request(app).get('/paths/planet-cpp');
    expect(pathRes.status).toBe(200);
    expect(pathRes.headers['content-type']).toContain('text/html');

    const dharmaRes = await request(app).get('/dharma');
    expect(dharmaRes.status).toBe(200);
    expect(dharmaRes.headers['content-type']).toContain('text/html');
  });
});

describe('YouTube URL Utility', () => {
  it('extracts ID from standard watch URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/watch?v=vLnPwxZdW4Y');
    expect(id).toBe('vLnPwxZdW4Y');
  });

  it('extracts ID from youtu.be short URL', () => {
    const id = extractYouTubeId('https://youtu.be/8jLOx1hD3_o?si=abc');
    expect(id).toBe('8jLOx1hD3_o');
  });

  it('extracts ID from embed URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/embed/rubv3x5vK44');
    expect(id).toBe('rubv3x5vK44');
  });

  it('extracts ID from YouTube Shorts URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/shorts/RBSGKlAvoiM');
    expect(id).toBe('RBSGKlAvoiM');
  });

  it('accepts raw 11-char ID', () => {
    const id = extractYouTubeId('zOjov-2OZ0E');
    expect(id).toBe('zOjov-2OZ0E');
  });

  it('returns null for invalid URLs', () => {
    expect(extractYouTubeId('https://example.com/not-youtube')).toBeNull();
  });
});

describe('Admin Authentication & Protection', () => {
  it('rejects unauthenticated requests to /api/admin/dashboard with 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ username: 'quazar_commander', password: 'WrongPassword123!' });
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('permits login with correct environment credentials and sets secure cookie', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({
        username: 'quazar_commander',
        password: 'MissionControl2026!DeepSpace',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();

    const cookies = res.headers['set-cookie'];
    const sessionCookie = cookies.find((c: string) => c.startsWith('quazar_admin_session='));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toContain('HttpOnly');

    // Test access to protected endpoint with cookie
    const dashboardRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', sessionCookie);

    expect(dashboardRes.status).toBe(200);
    expect(dashboardRes.body.success).toBe(true);
    expect(dashboardRes.body.data.metrics.paths.total).toBeGreaterThan(0);

    // Test logout invalidation
    const logoutRes = await request(app)
      .post('/api/admin/auth/logout')
      .set('Cookie', sessionCookie);
    expect(logoutRes.status).toBe(200);

    // Re-requesting with old cookie should fail
    const recheckRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', sessionCookie);
    expect(recheckRes.status).toBe(401);
  });
});
