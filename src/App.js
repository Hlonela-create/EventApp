// src/App.js
// ─────────────────────────────────────────────────────────────────────────────
// This file is the thin Firebase wrapper around the existing EventApp.
// It:
//   1. Loads all collections from Firestore (with real-time subscriptions)
//   2. Seeds Firestore on first run from the same seed data used in EventApp
//   3. Overrides the upload zones to use Firebase Storage via useUpload()
//   4. Wires push notification permission request
//   5. Passes everything into the existing <EventApp> component unchanged
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from "react";
import EventApp, {
  EVENTS_INIT,
  ANNOUNCEMENTS_INIT,
  USERS_INIT,
  BASES_INIT,
  NEWS_INIT,
} from "./EventApp";
import { useFirestoreCollection, fsSet, fsAdd, fsDelete } from "./useFirestore";
import { useUpload } from "./useUpload";
import { requestNotificationPermission, onForegroundMessage } from "./firebase";

export default function App() {
  // ── Real-time Firestore collections ──────────────────────────────────────
  const [events,        , ] = useFirestoreCollection("events",        EVENTS_INIT);
  const [announcements, , ] = useFirestoreCollection("announcements", ANNOUNCEMENTS_INIT);
  const [users,         , ] = useFirestoreCollection("users",         USERS_INIT);
  const [bases,         , ] = useFirestoreCollection("bases",         BASES_INIT);
  const [news,          , ] = useFirestoreCollection("news",          NEWS_INIT);

  // ── Upload hook (Firebase Storage or local fallback) ─────────────────────
  const { upload } = useUpload();

  // ── Push notifications ────────────────────────────────────────────────────
  useEffect(() => {
    // Request permission when the app loads
    requestNotificationPermission().then(token => {
      if (token) {
        // Future: store token in Firestore for server-side sending
        console.info("FCM token obtained:", token.slice(0, 20) + "…");
      }
    });

    // Handle foreground messages
    const unsub = onForegroundMessage(payload => {
      const { title, body } = payload?.notification || {};
      if (title && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/logo192.png" });
      }
    });
    return unsub;
  }, []);

  // ── Persistence wrappers (keep EventApp's setState + sync to Firestore) ───
  // These are passed as props so EventApp can call them directly.
  // EventApp already manages local state; these just mirror to Firestore.

  const persistEvent = async (ev) => {
    await fsSet("events", ev.id, ev);
  };
  const persistDeleteEvent = async (ev) => {
    await fsDelete("events", ev._firestoreId);
  };
  const persistAnnouncement = async (ann) => {
    await fsSet("announcements", ann.id, ann);
  };
  const persistDeleteAnnouncement = async (ann) => {
    await fsDelete("announcements", ann._firestoreId);
  };
  const persistUser = async (user) => {
    await fsSet("users", user.id, user);
  };
  const persistDeleteUser = async (user) => {
    await fsDelete("users", user._firestoreId);
  };
  const persistBase = async (base) => {
    await fsSet("bases", base.id, base);
  };
  const persistDeleteBase = async (base) => {
    await fsDelete("bases", base._firestoreId);
  };
  const persistNews = async (post) => {
    await fsSet("news", post.id, post);
  };
  const persistDeleteNews = async (post) => {
    await fsDelete("news", post._firestoreId);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render — pass Firebase-aware props into the existing EventApp
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <EventApp
      // Live data (falls back to seed if Firebase not configured)
      initialEvents={events}
      initialAnnouncements={announcements}
      initialUsers={users}
      initialBases={bases}
      initialNews={news}
      // Upload function (Firebase Storage or base64)
      uploadFile={upload}
      // Persistence callbacks
      onEventSave={persistEvent}
      onEventDelete={persistDeleteEvent}
      onAnnouncementSave={persistAnnouncement}
      onAnnouncementDelete={persistDeleteAnnouncement}
      onUserSave={persistUser}
      onUserDelete={persistDeleteUser}
      onBaseSave={persistBase}
      onBaseDelete={persistDeleteBase}
      onNewsSave={persistNews}
      onNewsDelete={persistDeleteNews}
    />
  );
}
