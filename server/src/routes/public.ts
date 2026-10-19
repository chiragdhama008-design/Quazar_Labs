import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// Health check
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const pathCount = await prisma.learningPath.count();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      pathsCount: pathCount,
      version: '1.0.0',
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Site settings
router.get('/site-settings', async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: { id: 'default' },
      });
    }

    res.json({ success: true, data: settings });
  } catch (err: any) {
    console.error('[Public API] Error getting site settings:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve site settings' });
  }
});

// Get all published learning paths
router.get('/learning-paths', async (_req: Request, res: Response) => {
  try {
    const paths = await prisma.learningPath.findMany({
      where: { publicationStatus: 'PUBLISHED' },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            workshops: {
              where: { publicationStatus: 'PUBLISHED' },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: paths.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        learningObjectives: p.learningObjectives,
        planetTheme: p.planetTheme,
        accentColor: p.accentColor,
        coverImageUrl: p.coverImageUrl,
        featured: p.featured,
        workshopCount: p._count.workshops,
        createdAt: p.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('[Public API] Error getting learning paths:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve learning paths' });
  }
});

// Get single published learning path by slug
router.get('/learning-paths/:slug', async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const path = await prisma.learningPath.findUnique({
      where: { slug },
      include: {
        workshops: {
          where: { publicationStatus: 'PUBLISHED' },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: {
              select: {
                weeks: {
                  where: { publicationStatus: 'PUBLISHED' },
                },
              },
            },
          },
        },
      },
    });

    if (!path || path.publicationStatus !== 'PUBLISHED') {
      res.status(404).json({ success: false, error: 'Learning path not found' });
      return;
    }

    res.json({ success: true, data: path });
  } catch (err: any) {
    console.error('[Public API] Error getting learning path:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve learning path' });
  }
});

// Explore / filter workshops
router.get('/workshops', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const pathSlug = typeof req.query.path === 'string' ? req.query.path.trim() : '';
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty.trim() : '';
    const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'order';

    const where: any = {
      publicationStatus: 'PUBLISHED',
      learningPath: {
        publicationStatus: 'PUBLISHED',
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (pathSlug) {
      where.learningPath.slug = pathSlug;
    }

    if (difficulty && ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      where.difficulty = difficulty;
    }

    let orderBy: any = { displayOrder: 'asc' };
    if (sort === 'recent') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'alpha') {
      orderBy = { title: 'asc' };
    }

    const workshops = await prisma.workshop.findMany({
      where,
      orderBy,
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            slug: true,
            planetTheme: true,
            accentColor: true,
          },
        },
        _count: {
          select: {
            weeks: {
              where: { publicationStatus: 'PUBLISHED' },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: workshops.map(w => ({
        ...w,
        weekCount: w._count.weeks,
      })),
    });
  } catch (err: any) {
    console.error('[Public API] Error getting workshops:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve workshops' });
  }
});

// Get single workshop by slug with weeks and sessions
router.get('/workshops/:slug', async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const workshop = await (prisma.workshop as any).findUnique({
      where: { slug },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            slug: true,
            planetTheme: true,
            accentColor: true,
            publicationStatus: true,
          },
        },
        weeks: {
          where: { publicationStatus: 'PUBLISHED' },
          orderBy: { displayOrder: 'asc' },
          include: {
            sessions: {
              where: { publicationStatus: 'PUBLISHED' },
              orderBy: { displayOrder: 'asc' },
              include: {
                resources: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (
      !workshop ||
      workshop.publicationStatus !== 'PUBLISHED' ||
      workshop.learningPath?.publicationStatus !== 'PUBLISHED'
    ) {
      res.status(404).json({ success: false, error: 'Workshop not found or unpublished' });
      return;
    }

    res.json({ success: true, data: workshop });
  } catch (err: any) {
    console.error('[Public API] Error getting workshop detail:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve workshop details' });
  }
});

// Get single session detail with previous/next session links
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const session = await (prisma.session as any).findUnique({
      where: { id },
      include: {
        resources: {
          orderBy: { displayOrder: 'asc' },
        },
        week: {
          include: {
            workshop: {
              include: {
                learningPath: true,
                weeks: {
                  where: { publicationStatus: 'PUBLISHED' },
                  orderBy: { displayOrder: 'asc' },
                  include: {
                    sessions: {
                      where: { publicationStatus: 'PUBLISHED' },
                      orderBy: { displayOrder: 'asc' },
                      select: {
                        id: true,
                        title: true,
                        duration: true,
                        displayOrder: true,
                        weekId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !session ||
      session.publicationStatus !== 'PUBLISHED' ||
      session.week?.publicationStatus !== 'PUBLISHED' ||
      session.week?.workshop?.publicationStatus !== 'PUBLISHED' ||
      session.week?.workshop?.learningPath?.publicationStatus !== 'PUBLISHED'
    ) {
      res.status(404).json({ success: false, error: 'Session not found or unavailable' });
      return;
    }

    // Flatten all published sessions across weeks in order to calculate previous and next
    const allOrderedSessions: Array<{ id: string; title: string }> = [];
    session.week.workshop.weeks.forEach((w: any) => {
      w.sessions.forEach((s: any) => {
        allOrderedSessions.push({ id: s.id, title: s.title });
      });
    });

    const currentIndex = allOrderedSessions.findIndex(s => s.id === session.id);
    const previousSession = currentIndex > 0 ? allOrderedSessions[currentIndex - 1] : null;
    const nextSession = currentIndex < allOrderedSessions.length - 1 ? allOrderedSessions[currentIndex + 1] : null;

    res.json({
      success: true,
      data: {
        ...session,
        previousSession,
        nextSession,
      },
    });
  } catch (err: any) {
    console.error('[Public API] Error getting session:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve session details' });
  }
});

export default router;
