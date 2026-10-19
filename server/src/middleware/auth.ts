import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../db';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    username: string;
  };
  sessionId?: string;
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });

  return list;
}

export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export async function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies['quazar_admin_session'];

    if (!sessionToken) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Administrative access requires authentication.',
      });
      return;
    }

    const session = await prisma.adminSession.findUnique({
      where: { id: sessionToken },
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired session token.',
      });
      return;
    }

    if (session.expiresAt < new Date()) {
      // Session expired, remove from database
      await prisma.adminSession.delete({ where: { id: sessionToken } }).catch(() => {});
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Session expired. Please log in again.',
      });
      return;
    }

    // Refresh last active timestamp asynchronously
    prisma.adminSession.update({
      where: { id: sessionToken },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    req.adminUser = { username: session.username };
    req.sessionId = sessionToken;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error verifying admin session:', err);
    res.status(500).json({
      success: false,
      error: 'Internal authentication verification error.',
    });
  }
}
