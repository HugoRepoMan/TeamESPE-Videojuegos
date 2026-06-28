import { z } from 'zod';
import { sanitizeString } from '../lib/sanitize';

const safeString = (maxLen = 100) =>
  z.string().max(maxLen).transform(sanitizeString);

export const userProfileSchema = z.object({
  displayName: safeString(50),
  nick: safeString(30),
  teamName: safeString(50).optional(),
});

export const registrationSchema = z.object({
  disciplineId: z.string().min(1),
  playerNick: safeString(30),
  teamName: safeString(50).optional(),
  paymentReceiptUrl: z.string().url().optional(),
});

export const paymentApprovalSchema = z.object({
  registrationId: z.string().min(1),
  paymentStatus: z.enum(['approved', 'rejected']),
  paymentReference: safeString(100).optional(),
});

export const matchResultSchema = z.object({
  playerAScore: z.number().int().min(0).max(3),
  playerBScore: z.number().int().min(0).max(3),
  bo3Games: z.array(z.object({
    playerAScore: z.number().int().min(0),
    playerBScore: z.number().int().min(0),
  })).max(3).optional(),
  status: z.enum(['scheduled', 'live', 'finished', 'walkover']),
  scheduledTime: z.string().optional(),
  winnerId: z.string().optional(),
});


export const treasuryFilterSchema = z.object({
  disciplineId: z.string().optional(),
  type: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
