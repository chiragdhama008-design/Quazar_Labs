export type PublicationStatus = 'DRAFT' | 'PUBLISHED';

export interface Resource {
  id: string;
  sessionId?: string | null;
  title: string;
  url: string;
  resourceType: 'DOCUMENT' | 'CODE' | 'SLIDES' | 'LINK' | 'VIDEO' | 'OTHER';
  description?: string | null;
  displayOrder: number;
}

export interface Session {
  id: string;
  weekId: string;
  title: string;
  description?: string | null;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  lessonNotes?: string | null;
  topics?: string | null;
  publicationStatus: PublicationStatus;
  displayOrder: number;
  resources?: Resource[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Week {
  id: string;
  workshopId: string;
  weekNumber: number;
  title: string;
  description?: string | null;
  displayOrder: number;
  publicationStatus: PublicationStatus;
  sessions?: Session[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Workshop {
  id: string;
  learningPathId: string;
  title: string;
  slug: string;
  description: string;
  learningObjectives?: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration?: string | null;
  thumbnailUrl?: string | null;
  publicationStatus: PublicationStatus;
  displayOrder: number;
  learningPath?: {
    id: string;
    title: string;
    slug: string;
    planetTheme?: string;
    accentColor?: string;
    publicationStatus?: PublicationStatus;
  };
  weeks?: Week[];
  weekCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  learningObjectives?: string | null;
  planetTheme: string;
  accentColor: string;
  coverImageUrl?: string | null;
  featured: boolean;
  publicationStatus: PublicationStatus;
  displayOrder: number;
  workshopCount?: number;
  workshops?: Workshop[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSetting {
  id: string;
  heroHeading: string;
  heroSubtitle: string;
  aboutText: string;
  contactEmail: string;
  githubUrl: string;
  discordUrl: string;
  youtubeUrl: string;
  footerText: string;
}

export interface SessionDetailResponse extends Session {
  week: {
    id: string;
    title: string;
    weekNumber: number;
    workshop: {
      id: string;
      title: string;
      slug: string;
      learningPath: LearningPath;
      weeks: Array<{
        id: string;
        weekNumber: number;
        title: string;
        sessions: Array<{
          id: string;
          title: string;
          duration?: string | null;
          displayOrder: number;
          weekId: string;
        }>;
      }>;
    };
  };
  previousSession?: { id: string; title: string } | null;
  nextSession?: { id: string; title: string } | null;
}

export interface DashboardMetrics {
  paths: { total: number; published: number; draft: number };
  workshops: { total: number; published: number; draft: number };
  weeks: { total: number };
  sessions: { total: number; published: number; draft: number };
  resources: { total: number };
  totalDrafts: number;
}
