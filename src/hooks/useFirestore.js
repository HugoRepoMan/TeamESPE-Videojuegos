import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../firebase/client';

/**
 * Subscribe to a Firestore collection in real time.
 *
 * @param {string} collectionName - Firestore collection path.
 * @param {import('firebase/firestore').QueryConstraint[]} [queryConstraints=[]]
 *   Optional array of Firestore query constraints (where, orderBy, limit, etc.).
 * @returns {{ data: object[], loading: boolean, error: Error|null }}
 */
export function useCollection(collectionName, queryConstraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const colRef = collection(db, collectionName);
    const q =
      queryConstraints.length > 0
        ? query(colRef, ...queryConstraints)
        : colRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // Serialize queryConstraints to a stable string so the effect re-runs
    // only when the actual constraints change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}

/**
 * Subscribe to a single Firestore document in real time.
 *
 * @param {string} collectionName - Firestore collection path.
 * @param {string|null} docId - Document ID to subscribe to, or null/undefined
 *   to skip the subscription.
 * @returns {{ data: object|null, loading: boolean, error: Error|null }}
 */
export function useDocument(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
}
