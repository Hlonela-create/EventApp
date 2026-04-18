// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration
// Replace the values below with your own Firebase project credentials.
// How to get them:
//   1. Go to https://console.firebase.google.com
//   2. Create a project (or open existing)
//   3. Project Settings → General → "Your apps" → Add web app
//   4. Copy the firebaseConfig object shown and paste below
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ── YOUR FIREBASE CONFIG (replace with real values) ──────────────────────────
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || "YOUR_AUTH_DOMAIN",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID|| "YOUR_SENDER_ID",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || "YOUR_APP_ID",
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

// Messaging is optional – only initialise if supported
let messaging = null;
try { messaging = getMessaging(app); } catch (_) {}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD HELPER
// Uploads a File object to Firebase Storage and returns the public download URL.
// path example: "events/image_1234567.jpg"
// onProgress(0–100) optional callback
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadFile(file, path, onProgress) {
  const storageRef = ref(storage, path);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: { originalName: file.name },
    });
    task.on(
      "state_changed",
      snap => onProgress && onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE a file from Firebase Storage by its full storage path or download URL
// Used by Media Library "Delete" button
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteStorageFile(storagePath) {
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (e) {
    console.warn("deleteStorageFile error:", e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const eventsCol        = () => collection(db, "events");
export const announcementsCol = () => collection(db, "announcements");
export const usersCol         = () => collection(db, "users");
export const basesCol         = () => collection(db, "bases");
export const newsCol          = () => collection(db, "news");

// Get all documents in a collection
export async function getCollection(col) {
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Get a single document by ID
export async function getDocument(colName, id) {
  const snap = await getDoc(doc(db, colName, String(id)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addDocument(col, data) {
  const docRef = await addDoc(col, { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function setDocument(colName, id, data) {
  await setDoc(doc(db, colName, String(id)), { ...data, updatedAt: serverTimestamp() });
}

export async function updateDocument(colName, id, data) {
  await updateDoc(doc(db, colName, String(id)), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(colName, id) {
  await deleteDoc(doc(db, colName, String(id)));
}

// Real-time listener for a collection, ordered by createdAt descending
export function subscribeCollection(colName, callback) {
  const q = query(collection(db, colName), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUSH NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY || "YOUR_VAPID_KEY",
    });
    return token;
  } catch (e) {
    console.warn("Notification permission error:", e);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export { db, storage, messaging };
