import { z } from 'zod';
import { sanitizeString } from '../lib/sanitize';

const safeString = (maxLen = 100) =>
  z.string().max(maxLen).transform(sanitizeString);

// userProfileSchema: only allow known profile fields.
// .strict() ensures extra unknown fields (e.g. roleVisible, uid) are rejected.
export const userProfileSchema = z.object({
  displayName: safeString(50),
  nick: safeString(30),
  teamName: safeString(50).optional(),
}).strict();

// registrationSchema: validates fields the user provides when registering.
// userId, amount, paymentStatus are enforced by the service / Firestore rules.
export const registrationSchema = z.object({
  disciplineId: z.string().min(1),
  playerNick: safeString(30),
  teamName: safeString(50).optional(),
  teamMembers: z.array(safeString(30)).optional(),
  paymentReceiptUrl: z.string().url().optional(),
}).strict().superRefine((data, ctx) => {
  if (data.disciplineId === 'league-of-legends') {
    if (!data.teamName || data.teamName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre del equipo es obligatorio para League of Legends.',
        path: ['teamName'],
      });
    }
    if (!data.teamMembers || data.teamMembers.length !== 4 || data.teamMembers.some(m => !m || m.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe incluir a los 4 integrantes del equipo.',
        path: ['teamMembers'],
      });
    }
  }
});

export const paymentApprovalSchema = z.object({
  registrationId: z.string().min(1),
  paymentStatus: z.enum(['approved', 'rejected']),
  paymentReference: safeString(100).optional(),
}).strict();

// matchResultSchema: validates match result fields strictly.
// Player advancement (playerAId, playerBName, etc.) is handled by a
// dedicated updateMatchPlayers() service function, not through this schema.
export const matchResultSchema = z.object({
  playerAScore: z.number().int().min(0).max(3),
  playerBScore: z.number().int().min(0).max(3),
  bo3Games: z.array(z.object({
    playerAScore: z.number().int().min(0),
    playerBScore: z.number().int().min(0),
  })).max(3).optional(),
  status: z.enum(['scheduled', 'live', 'finished', 'completed', 'walkover']),
  scheduledTime: z.string().nullable().optional(),
  winnerId: z.string().nullable().optional(),
}).strict();

export const treasuryFilterSchema = z.object({
  disciplineId: z.string().optional(),
  type: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).strict();
