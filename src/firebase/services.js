import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { ref as rtdbRef, set, onValue } from 'firebase/database';
import { db, rtdb } from './client';
import { sanitizeString, sanitizeDocId } from '../lib/sanitize';
import {
  userProfileSchema,
  registrationSchema,
  paymentApprovalSchema,
  matchResultSchema,
  overlayUpdateSchema,
  treasuryFilterSchema,
} from '../schemas';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Retrieve a user profile document from Firestore.
 * @param {string} uid - The user's UID.
 * @returns {Promise<object|null>} The user profile data or null if not found.
 */
export async function getUserProfile(uid) {
  const safeUid = sanitizeDocId(uid);
  const snap = await getDoc(doc(db, 'users', safeUid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update a user profile after Zod validation.
 * @param {string} uid - The user's UID.
 * @param {object} data - Fields to update.
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, data) {
  const safeUid = sanitizeDocId(uid);
  const parsed = userProfileSchema.parse(data);
  await updateDoc(doc(db, 'users', safeUid), {
    ...parsed,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Disciplines
// ---------------------------------------------------------------------------

/**
 * Get all active disciplines.
 * @returns {Promise<object[]>}
 */
export async function getDisciplines() {
  const q = query(collection(db, 'disciplines'), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

/**
 * Create a new tournament registration.
 * @param {object} data - Registration payload (validated with Zod).
 * @returns {Promise<string>} The new document ID.
 */
export async function createRegistration(data) {
  const parsed = registrationSchema.parse(data);
  const docRef = await addDoc(collection(db, 'registrations'), {
    ...parsed,
    paymentStatus: 'pending',
    amount: 2,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Upload a payment receipt to ImgBB.
 * @param {File} file - The file to upload.
 * @param {string} userId - The user's ID (not used strictly for ImgBB but kept for signature).
 * @returns {Promise<string>} The public download URL.
 */
export async function uploadPaymentReceipt(file, userId) {
  if (!file) throw new Error("No file provided");
  
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) throw new Error("ImgBB API key is missing");

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error?.message || "Failed to upload image to ImgBB");
  }

  return data.data.url;
}

/**
 * Get all registrations for a specific user.
 * @param {string} userId - The user's UID.
 * @returns {Promise<object[]>}
 */
export async function getRegistrationsByUser(userId) {
  const safeId = sanitizeDocId(userId);
  const q = query(
    collection(db, 'registrations'),
    where('userId', '==', safeId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get all registrations for a specific discipline.
 * @param {string} disciplineId - The discipline document ID.
 * @returns {Promise<object[]>}
 */
export async function getRegistrationsByDiscipline(disciplineId) {
  const safeId = sanitizeDocId(disciplineId);
  const q = query(
    collection(db, 'registrations'),
    where('disciplineId', '==', safeId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get approved registrations for a discipline.
 * @param {string} disciplineId - The discipline document ID.
 * @returns {Promise<object[]>}
 */
export async function getApprovedRegistrations(disciplineId) {
  const safeId = sanitizeDocId(disciplineId);
  const q = query(
    collection(db, 'registrations'),
    where('disciplineId', '==', safeId),
    where('paymentStatus', '==', 'approved')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Update the payment status of a registration (admin action).
 * @param {string} registrationId - The registration document ID.
 * @param {string} status - 'approved' or 'rejected'.
 * @param {string} adminUid - The admin's UID performing the action.
 * @returns {Promise<void>}
 */
export async function updatePaymentStatus(registrationId, status, adminUid) {
  const safeRegId = sanitizeDocId(registrationId);
  const safeAdminUid = sanitizeDocId(adminUid);
  paymentApprovalSchema.parse({
    registrationId: safeRegId,
    paymentStatus: status,
  });
  await updateDoc(doc(db, 'registrations', safeRegId), {
    paymentStatus: status,
    reviewedBy: safeAdminUid,
    reviewedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------

/**
 * Create a new match document.
 * @param {object} data - Match data.
 * @returns {Promise<string>} The new document ID.
 */
export async function createMatch(data) {
  const sanitizedData = {
    ...data,
    playerAName: data.playerAName
      ? sanitizeString(data.playerAName, 50)
      : '',
    playerBName: data.playerBName
      ? sanitizeString(data.playerBName, 50)
      : '',
  };
  const docRef = await addDoc(collection(db, 'matches'), {
    ...sanitizedData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update match result (admin action).
 * @param {string} matchId - The match document ID.
 * @param {object} data - Updated result fields.
 * @returns {Promise<void>}
 */
export async function updateMatchResult(matchId, data) {
  const safeMatchId = sanitizeDocId(matchId);
  const parsed = matchResultSchema.parse(data);
  await updateDoc(doc(db, 'matches', safeMatchId), {
    ...parsed,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get all matches for a discipline.
 * @param {string} disciplineId - The discipline document ID.
 * @returns {Promise<object[]>}
 */
export async function getMatchesByDiscipline(disciplineId) {
  const safeId = sanitizeDocId(disciplineId);
  const q = query(
    collection(db, 'matches'),
    where('disciplineId', '==', safeId),
    orderBy('round'),
    orderBy('bracketPosition')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get all matches involving a specific user (as playerA or playerB).
 * Because Firestore does not support OR queries across different fields in a
 * single query, two queries are executed and results are merged.
 * @param {string} userId - The user's UID.
 * @returns {Promise<object[]>}
 */
export async function getMatchesByUser(userId) {
  const safeId = sanitizeDocId(userId);
  const qA = query(
    collection(db, 'matches'),
    where('playerAId', '==', safeId)
  );
  const qB = query(
    collection(db, 'matches'),
    where('playerBId', '==', safeId)
  );
  const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);
  const map = new Map();
  snapA.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
  snapB.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Treasury
// ---------------------------------------------------------------------------

/**
 * Query treasury entries with optional filters.
 * @param {object} [filters={}] - Optional filter object.
 * @returns {Promise<object[]>}
 */
export async function getTreasuryEntries(filters = {}) {
  const parsed = treasuryFilterSchema.parse(filters);
  const constraints = [];

  if (parsed.disciplineId) {
    constraints.push(where('disciplineId', '==', parsed.disciplineId));
  }
  if (parsed.type) {
    constraints.push(where('type', '==', parsed.type));
  }
  if (parsed.dateFrom) {
    constraints.push(where('date', '>=', parsed.dateFrom));
  }
  if (parsed.dateTo) {
    constraints.push(where('date', '<=', parsed.dateTo));
  }

  const q = query(collection(db, 'treasury'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new treasury entry (admin action).
 * @param {object} data - Treasury entry data.
 * @returns {Promise<string>} The new document ID.
 */
export async function createTreasuryEntry(data) {
  const sanitizedData = {
    ...data,
    description: data.description
      ? sanitizeString(data.description, 200)
      : '',
  };
  const docRef = await addDoc(collection(db, 'treasury'), {
    ...sanitizedData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ---------------------------------------------------------------------------
// Live Overlay (Realtime Database)
// ---------------------------------------------------------------------------

/**
 * Write overlay data to the Realtime Database.
 * @param {object} data - Overlay payload.
 * @returns {Promise<void>}
 */
export async function updateOverlay(data) {
  const parsed = overlayUpdateSchema.parse(data);
  await set(rtdbRef(rtdb, 'liveOverlay'), parsed);
}

/**
 * Subscribe to live overlay changes.
 * @param {function} callback - Called with the overlay data on every change.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToOverlay(callback) {
  const overlayNodeRef = rtdbRef(rtdb, 'liveOverlay');
  const unsubscribe = onValue(overlayNodeRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
}

// ---------------------------------------------------------------------------
// Public Settings
// ---------------------------------------------------------------------------

/**
 * Read the public settings document from Firestore.
 * @returns {Promise<object|null>}
 */
export async function getPublicSettings() {
  const snap = await getDoc(doc(db, 'settings', 'public'));
  return snap.exists() ? snap.data() : null;
}
