import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { prisma } from '../db';
import { LoginSchema } from '../utils/validation';
import { parseCookies, generateSessionToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Rate limiter for admin login: 10 attempts per 15 minutes per IP
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many authentication attempts. Telemetry locked. Please retry in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Run constant time comparison against dummy to prevent timing leaks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Admin login
router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid input. Both username and password are required.',
      });
      return;
    }

    const { username, password } = parseResult.data;
    const configuredUsername = process.env.ADMIN_USERNAME?.trim();
    const configuredPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!configuredUsername || !configuredPassword) {
      console.error('[CRITICAL SECURITY WARNING] ADMIN_USERNAME or ADMIN_PASSWORD is missing in server environment variables.');
      res.status(500).json({
        success: false,
        error: 'Administrative access is temporarily unconfigured on this station.',
      });
      return;
    }

    const isUsernameMatch = safeCompare(username, configuredUsername);
    const isPasswordMatch = safeCompare(password, configuredPassword);

    if (!isUsernameMatch || !isPasswordMatch) {
      // Intentionally generic error response
      res.status(401).json({
        success: false,
        error: 'Invalid command station credentials.',
      });
      return;
    }

    // Generate secure session token and store in database
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.adminSession.create({
      data: {
        id: sessionToken,
        username: configuredUsername,
        expiresAt,
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('quazar_admin_session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Command sequence authenticated. Welcome to Quazar Mission Control.',
      user: {
        username: configuredUsername,
        role: 'Station Administrator',
      },
    });
  } catch (err: any) {
    console.error('[Auth API] Login exception:', err);
    res.status(500).json({
      success: false,
      error: 'An internal authentication error occurred.',
    });
  }
});

// Admin logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies['quazar_admin_session'];

    if (sessionToken) {
      await prisma.adminSession.delete({
        where: { id: sessionToken },
      }).catch(() => {});
    }

    res.clearCookie('quazar_admin_session', {
      httpOnly: true,
      path: '/',
    });

    res.json({
      success: true,
      message: 'Session terminated. Station locked.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Logout error.',
    });
  }
});

// Admin verify session
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies['quazar_admin_session'];

    if (!sessionToken) {
      res.status(401).json({ success: false, authenticated: false });
      return;
    }

    const session = await prisma.adminSession.findUnique({
      where: { id: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.adminSession.delete({ where: { id: sessionToken } }).catch(() => {});
      }
      res.status(401).json({ success: false, authenticated: false });
      return;
    }

    res.json({
      success: true,
      authenticated: true,
      user: {
        username: session.username,
        role: 'Station Administrator',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, authenticated: false });
  }
});

export default router;
