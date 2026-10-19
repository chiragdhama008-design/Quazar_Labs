import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { getPrismaClient } from './db';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

async function bootstrap() {
  try {
    console.log('[Quazar Mission Control] Initializing server and connecting database...');
    await getPrismaClient();

    const app = createApp();

    const server = app.listen(PORT, HOST, () => {
      console.log(`[Quazar Labs] Server listening on http://${HOST}:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    const shutdown = async (signal: string) => {
      console.log(`[Quazar Mission Control] Received ${signal}. Powering down thrusters...`);
      server.close(() => {
        console.log('[Quazar Mission Control] Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Quazar Mission Control] Fatal startup malfunction:', err);
    process.exit(1);
  }
}

bootstrap();
