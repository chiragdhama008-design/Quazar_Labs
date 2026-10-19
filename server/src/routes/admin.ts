import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  LearningPathSchema,
  WorkshopSchema,
  WeekSchema,
  SessionSchema,
  ResourceSchema,
  SiteSettingSchema,
} from '../utils/validation';
import { extractYouTubeId } from '../utils/youtube';

const router = Router();

// Protect all admin routes with authentication middleware
router.use(requireAdminAuth);

// Dashboard metrics
router.get('/dashboard', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalPaths,
      publishedPaths,
      draftPaths,
      totalWorkshops,
      publishedWorkshops,
      draftWorkshops,
      totalWeeks,
      totalSessions,
      publishedSessions,
      draftSessions,
      totalResources,
      recentWorkshops,
    ] = await Promise.all([
      prisma.learningPath.count(),
      prisma.learningPath.count({ where: { publicationStatus: 'PUBLISHED' } }),
      prisma.learningPath.count({ where: { publicationStatus: 'DRAFT' } }),
      prisma.workshop.count(),
      prisma.workshop.count({ where: { publicationStatus: 'PUBLISHED' } }),
      prisma.workshop.count({ where: { publicationStatus: 'DRAFT' } }),
      prisma.week.count(),
      prisma.session.count(),
      prisma.session.count({ where: { publicationStatus: 'PUBLISHED' } }),
      prisma.session.count({ where: { publicationStatus: 'DRAFT' } }),
      prisma.resource.count(),
      prisma.workshop.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          learningPath: { select: { title: true } },
          _count: { select: { weeks: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          paths: { total: totalPaths, published: publishedPaths, draft: draftPaths },
          workshops: { total: totalWorkshops, published: publishedWorkshops, draft: draftWorkshops },
          weeks: { total: totalWeeks },
          sessions: { total: totalSessions, published: publishedSessions, draft: draftSessions },
          resources: { total: totalResources },
          totalDrafts: draftPaths + draftWorkshops + draftSessions,
        },
        recentWorkshops: recentWorkshops.map(w => ({
          id: w.id,
          title: w.title,
          slug: w.slug,
          learningPathTitle: w.learningPath.title,
          publicationStatus: w.publicationStatus,
          weekCount: w._count.weeks,
          updatedAt: w.updatedAt,
        })),
      },
    });
  } catch (err: any) {
    console.error('[Admin API] Dashboard metrics error:', err);
    res.status(500).json({ success: false, error: 'Failed to aggregate dashboard metrics' });
  }
});

// ==========================================
// LEARNING PATHS CRUD
// ==========================================

router.get('/learning-paths', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const paths = await prisma.learningPath.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { workshops: true },
        },
      },
    });
    res.json({ success: true, data: paths });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve learning paths' });
  }
});

router.post('/learning-paths', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = LearningPathSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const existing = await prisma.learningPath.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      res.status(400).json({ success: false, error: 'A learning path with this slug already exists.' });
      return;
    }

    const path = await prisma.learningPath.create({
      data: parsed.data,
    });
    res.status(201).json({ success: true, data: path });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create learning path' });
  }
});

router.put('/learning-paths/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const parsed = LearningPathSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const existingSlug = await prisma.learningPath.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (existingSlug) {
      res.status(400).json({ success: false, error: 'Another learning path is already using this slug.' });
      return;
    }

    const path = await prisma.learningPath.update({
      where: { id },
      data: parsed.data,
    });
    res.json({ success: true, data: path });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update learning path' });
  }
});

router.delete('/learning-paths/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.learningPath.delete({ where: { id } });
    res.json({ success: true, message: 'Learning path and all associated workshops removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete learning path' });
  }
});

// ==========================================
// WORKSHOPS CRUD
// ==========================================

router.get('/workshops', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const workshops = await prisma.workshop.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        learningPath: { select: { id: true, title: true, slug: true } },
        _count: { select: { weeks: true } },
      },
    });
    res.json({ success: true, data: workshops });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve workshops' });
  }
});

router.post('/workshops', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = WorkshopSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const existing = await prisma.workshop.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      res.status(400).json({ success: false, error: 'A workshop with this slug already exists.' });
      return;
    }

    const workshop = await prisma.workshop.create({
      data: parsed.data,
      include: {
        learningPath: { select: { title: true } },
      },
    });
    res.status(201).json({ success: true, data: workshop });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create workshop' });
  }
});

router.put('/workshops/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const parsed = WorkshopSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const existingSlug = await prisma.workshop.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });
    if (existingSlug) {
      res.status(400).json({ success: false, error: 'Another workshop is already using this slug.' });
      return;
    }

    const workshop = await prisma.workshop.update({
      where: { id },
      data: parsed.data,
      include: { learningPath: { select: { title: true } } },
    });
    res.json({ success: true, data: workshop });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update workshop' });
  }
});

router.delete('/workshops/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.workshop.delete({ where: { id } });
    res.json({ success: true, message: 'Workshop removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete workshop' });
  }
});

// Duplicate workshop with all weeks, sessions, and resources
router.post('/workshops/:id/duplicate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const original = await (prisma.workshop as any).findUnique({
      where: { id },
      include: {
        weeks: {
          include: {
            sessions: {
              include: {
                resources: true,
              },
            },
          },
        },
      },
    });

    if (!original) {
      res.status(404).json({ success: false, error: 'Workshop to duplicate not found' });
      return;
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const duplicate = await prisma.workshop.create({
      data: {
        learningPathId: original.learningPathId,
        title: `${original.title} (Copy)`,
        slug: newSlug,
        description: original.description,
        learningObjectives: original.learningObjectives,
        difficulty: original.difficulty,
        estimatedDuration: original.estimatedDuration,
        thumbnailUrl: original.thumbnailUrl,
        publicationStatus: 'DRAFT', // Always create duplicates as draft
        displayOrder: original.displayOrder + 1,
        weeks: {
          create: original.weeks.map((w: any) => ({
            weekNumber: w.weekNumber,
            title: w.title,
            description: w.description,
            displayOrder: w.displayOrder,
            publicationStatus: 'DRAFT',
            sessions: {
              create: w.sessions.map((s: any) => ({
                title: s.title,
                description: s.description,
                youtubeUrl: s.youtubeUrl,
                youtubeVideoId: s.youtubeVideoId,
                thumbnailUrl: s.thumbnailUrl,
                duration: s.duration,
                lessonNotes: s.lessonNotes,
                topics: s.topics,
                publicationStatus: 'DRAFT',
                displayOrder: s.displayOrder,
                resources: {
                  create: s.resources.map((r: any) => ({
                    title: r.title,
                    url: r.url,
                    resourceType: r.resourceType,
                    description: r.description,
                    displayOrder: r.displayOrder,
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    res.status(201).json({ success: true, data: duplicate });
  } catch (err: any) {
    console.error('[Admin API] Workshop duplication error:', err);
    res.status(500).json({ success: false, error: 'Failed to duplicate workshop' });
  }
});

// ==========================================
// WEEKS CRUD
// ==========================================

router.get('/workshops/:workshopId/weeks', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workshopId = String(req.params.workshopId);
    const weeks = await prisma.week.findMany({
      where: { workshopId },
      orderBy: { displayOrder: 'asc' },
      include: {
        sessions: {
          orderBy: { displayOrder: 'asc' },
          include: { resources: true },
        },
      },
    });
    res.json({ success: true, data: weeks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve weeks' });
  }
});

router.post('/weeks', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = WeekSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const week = await prisma.week.create({
      data: parsed.data,
      include: { sessions: true },
    });
    res.status(201).json({ success: true, data: week });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create week' });
  }
});

router.put('/weeks/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const parsed = WeekSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const week = await prisma.week.update({
      where: { id },
      data: parsed.data,
      include: { sessions: true },
    });
    res.json({ success: true, data: week });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update week' });
  }
});

router.delete('/weeks/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.week.delete({ where: { id } });
    res.json({ success: true, message: 'Week and associated sessions removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete week' });
  }
});

// ==========================================
// SESSIONS CRUD
// ==========================================

router.get('/weeks/:weekId/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const weekId = String(req.params.weekId);
    const sessions = await prisma.session.findMany({
      where: { weekId },
      orderBy: { displayOrder: 'asc' },
      include: { resources: true },
    });
    res.json({ success: true, data: sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve sessions' });
  }
});

router.post('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = SessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    // Auto extract YouTube ID if not explicitly provided
    let videoId = parsed.data.youtubeVideoId?.trim() || '';
    if (!videoId) {
      const extracted = extractYouTubeId(parsed.data.youtubeUrl);
      if (!extracted) {
        res.status(400).json({ success: false, error: 'Invalid YouTube URL. Unable to extract valid video ID.' });
        return;
      }
      videoId = extracted;
    }

    const session = await prisma.session.create({
      data: {
        ...parsed.data,
        youtubeVideoId: videoId,
      },
      include: { resources: true },
    });
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

router.put('/sessions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const parsed = SessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    let videoId = parsed.data.youtubeVideoId?.trim() || '';
    if (!videoId) {
      const extracted = extractYouTubeId(parsed.data.youtubeUrl);
      if (!extracted) {
        res.status(400).json({ success: false, error: 'Invalid YouTube URL.' });
        return;
      }
      videoId = extracted;
    }

    const session = await prisma.session.update({
      where: { id },
      data: {
        ...parsed.data,
        youtubeVideoId: videoId,
      },
      include: { resources: true },
    });
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update session' });
  }
});

router.delete('/sessions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.session.delete({ where: { id } });
    res.json({ success: true, message: 'Session removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
});

// ==========================================
// RESOURCES CRUD
// ==========================================

router.post('/resources', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ResourceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const resource = await prisma.resource.create({
      data: parsed.data,
    });
    res.status(201).json({ success: true, data: resource });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to add resource' });
  }
});

router.delete('/resources/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.resource.delete({ where: { id } });
    res.json({ success: true, message: 'Resource removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete resource' });
  }
});

// ==========================================
// SITE SETTINGS
// ==========================================

router.get('/site-settings', async (_req: AuthenticatedRequest, res: Response) => {
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
    res.status(500).json({ success: false, error: 'Failed to retrieve site settings' });
  }
});

router.put('/site-settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = SiteSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }

    const settings = await prisma.siteSetting.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...parsed.data },
      update: parsed.data,
    });
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update site settings' });
  }
});

export default router;
