import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import publicRoutes from './routes/public';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

export function createApp(): express.Application {
  const app = express();

  // Helmet with customized CSP for YouTube embeds, SVGs, and web fonts
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          frameSrc: [
            "'self'",
            "https://www.youtube.com",
            "https://www.youtube-nocookie.com",
            "https://youtube.com",
          ],
          connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: process.env.NODE_ENV === 'production' ? true : [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api/public', publicRoutes);
  app.use('/api/admin/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  // Fallback for unknown /api routes - return JSON 404, NEVER index.html!
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Telemetry route not found in Quazar API orbit.',
    });
  });

  // Serve static assets from production client build if available
  const clientBuildPath = path.resolve(process.cwd(), 'dist', 'client');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    // Client-side SPA routing fallback for direct URL visits and browser refreshes
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    // If running in development without built client, provide helpful message on root
    app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Quazar Labs API Gateway is online.',
        portal: 'Run client in dev mode at http://localhost:5173 or build via npm run build',
        health: '/api/public/health',
      });
    });
  }

  // Centralized Error Handling Middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Station Error]', err);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
      success: false,
      error: isProduction ? 'An unexpected telemetry error occurred.' : (err.message || 'Internal error'),
    });
  });

  return app;
}
