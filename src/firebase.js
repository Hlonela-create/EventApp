// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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

// ── Firebase project config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBVq11dUDFpWK7ZOjHxV7rcFtPrHsEyZ90",
  authDomain:        "eventhub-49f58.firebaseapp.com",
  projectId:         "eventhub-49f58",
  storageBucket:     "eventhub-49f58.firebasestorage.app",
  messagingSenderId: "872545998325",
  appId:             "1:872545998325:web:4d6980216b2eb60bb43cbc",
  measurementId:     "G-05W8D3CZP5",
};

const app = initializeApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Messaging is optional — only initialise if supported in this browser
let messaging = null;
try { messaging = getMessaging(app); } catch (_) {}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPER
// Converts an 8-digit force number to the internal Firebase email.
// Users never see or type this email — the UI is unchanged.
// ─────────────────────────────────────────────────────────────────────────────
export function forceNumberToEmail(forceNumber) {
  return `${forceNumber}@eventhub.app`;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD HELPER
// Uploads a File to Firebase Storage, returns the CDN download URL.
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
// DELETE a file from Firebase Storage by its storage path
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
// FIRESTORE HELPERS (all existing — unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export const eventsCol        = () => collection(db, "events");
export const announcementsCol = () => collection(db, "announcements");
export const usersCol         = () => collection(db, "users");
export const basesCol         = () => collection(db, "bases");
export const newsCol          = () => collection(db, "news");

export async function getCollection(col) {
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

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
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY || "",
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

export { messaging };
