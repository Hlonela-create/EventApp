// src/useFirestore.js
// Real-time Firestore hook + write helpers.
// Firebase is always configured (config is in firebase.js directly).
import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// Always true now that real credentials are embedded in firebase.js
export const FIREBASE_CONFIGURED = true;

// ─────────────────────────────────────────────────────────────────────────────
// Seed a collection with initial data if it is empty on first run
// ─────────────────────────────────────────────────────────────────────────────
async function seedIfEmpty(colName, seedData) {
  try {
    const { getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, colName));
    if (snap.empty) {
      for (const item of seedData) {
        // eslint-disable-next-line no-unused-vars
        const { id, ...rest } = item;
        await setDoc(doc(db, colName, String(id)), {
          ...rest,
          _localId: id,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (e) {
    console.warn(`Seed ${colName} failed:`, e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// useFirestoreCollection
// Subscribes to a Firestore collection in real-time.
// Seeds initial data if collection is empty (first run).
// Returns [data, loading, error]
// ─────────────────────────────────────────────────────────────────────────────
export function useFirestoreCollection(colName, seedData = []) {
  const [data, setData]       = useState(seedData);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const unsub = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await seedIfEmpty(colName, seedData);

        const q = query(collection(db, colName), orderBy("createdAt", "desc"));
        unsub.current = onSnapshot(
          q,
          snap => {
            if (!mounted) return;
            const docs = snap.docs.map(d => ({
              ...d.data(),
              id: d.data()._localId || d.id,
              _firestoreId: d.id,
            }));
            setData(docs);
            setLoading(false);
          },
          err => {
            console.error(`Firestore ${colName} error:`, err);
            setError(err.message);
            // Fall back to seed data so the UI still renders
            setData(seedData);
            setLoading(false);
          }
        );
      } catch (e) {
        setError(e.message);
        setData(seedData);
        setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
      unsub.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colName]);

  return [data, loading, error];
}

// ─────────────────────────────────────────────────────────────────────────────
// Write helpers
// ─────────────────────────────────────────────────────────────────────────────

// Upsert a document (merge: true)
export async function fsSet(colName, id, data) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { id: _id, _firestoreId, ...rest } = data;
    await setDoc(doc(db, colName, String(id)), {
      ...rest,
      _localId: id,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) { console.warn("fsSet error:", e.message); }
}

// Add a new document, returns the Firestore docId
export async function fsAdd(colName, data) {
  try {
    // eslint-disable-next-line no-unused-vars
    const { id: _id, _firestoreId, ...rest } = data;
    const ref = await addDoc(collection(db, colName), {
      ...rest,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (e) {
    console.warn("fsAdd error:", e.message);
    return String(Date.now());
  }
}

// Delete a document by its Firestore document ID
export async function fsDelete(colName, firestoreId) {
  if (!firestoreId) return;
  try {
    const { deleteDoc, doc: fDoc } = await import("firebase/firestore");
    await deleteDoc(fDoc(db, colName, firestoreId));
  } catch (e) { console.warn("fsDelete error:", e.message); }
}
