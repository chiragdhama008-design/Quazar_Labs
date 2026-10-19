import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const LearningPathSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  learningObjectives: z.string().optional().nullable(),
  planetTheme: z.string().default('purple-gas-giant'),
  accentColor: z.string().default('#8B5CF6'),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal('')),
  featured: z.boolean().default(false),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  displayOrder: z.number().int().default(0),
});

export const WorkshopSchema = z.object({
  learningPathId: z.string().min(1, 'Learning path is required'),
  title: z.string().min(2).max(150),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10),
  learningObjectives: z.string().optional().nullable(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  estimatedDuration: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  displayOrder: z.number().int().default(0),
});

export const WeekSchema = z.object({
  workshopId: z.string().min(1, 'Workshop is required'),
  weekNumber: z.number().int().min(1),
  title: z.string().min(2).max(150),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
});

export const SessionSchema = z.object({
  weekId: z.string().min(1, 'Week is required'),
  title: z.string().min(2).max(150),
  description: z.string().optional().nullable(),
  youtubeUrl: z.string().min(5, 'YouTube URL is required'),
  youtubeVideoId: z.string().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  duration: z.string().optional().nullable(),
  lessonNotes: z.string().optional().nullable(),
  topics: z.string().optional().nullable(),
  publicationStatus: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  displayOrder: z.number().int().default(0),
});

export const ResourceSchema = z.object({
  sessionId: z.string().optional().nullable(),
  title: z.string().min(2).max(150),
  url: z.string().url('Must be a valid URL'),
  resourceType: z.enum(['DOCUMENT', 'CODE', 'SLIDES', 'LINK', 'VIDEO', 'OTHER']).default('LINK'),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
});

export const SiteSettingSchema = z.object({
  heroHeading: z.string().min(5),
  heroSubtitle: z.string().min(10),
  aboutText: z.string().min(20),
  contactEmail: z.string().email(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  discordUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  footerText: z.string().min(5),
});
