// src/useFirestore.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom React hook that:
//   • Loads a Firestore collection once on mount (seed if empty)
//   • Subscribes to real-time updates (onSnapshot)
//   • Returns [data, loading, error]
//
// Falls back to local seed data if Firebase is not yet configured
// (i.e. still contains "YOUR_API_KEY") so the UI always renders.
// ─────────────────────────────────────────────────────────────────────────────
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

const FIREBASE_CONFIGURED =
  !process.env.REACT_APP_FIREBASE_API_KEY?.includes("YOUR") &&
  process.env.REACT_APP_FIREBASE_API_KEY?.length > 10;

// Seed a collection with initial data if it's empty
async function seedIfEmpty(colName, seedData) {
  try {
    const { getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, colName));
    if (snap.empty) {
      for (const item of seedData) {
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

export function useFirestoreCollection(colName, seedData = [], sortKey = "createdAt") {
  const [data, setData]       = useState(seedData);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const unsub = useRef(null);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      // Firebase not set up yet — use local seed data
      setData(seedData);
      setLoading(false);
      return;
    }

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

// Write helpers that work with or without Firebase
export async function fsSet(colName, id, data) {
  if (!FIREBASE_CONFIGURED) return;
  try {
    const { id: _, _firestoreId, ...rest } = data;
    await setDoc(doc(db, colName, String(id)), {
      ...rest,
      _localId: id,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) { console.warn("fsSet error:", e.message); }
}

export async function fsAdd(colName, data) {
  if (!FIREBASE_CONFIGURED) return String(Date.now());
  try {
    const { id: _, _firestoreId, ...rest } = data;
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

export async function fsDelete(colName, firestoreId) {
  if (!FIREBASE_CONFIGURED || !firestoreId) return;
  try {
    const { deleteDoc, doc: fDoc } = await import("firebase/firestore");
    await deleteDoc(fDoc(db, colName, firestoreId));
  } catch (e) { console.warn("fsDelete error:", e.message); }
}

export { FIREBASE_CONFIGURED };
