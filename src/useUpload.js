// src/useUpload.js
// ─────────────────────────────────────────────────────────────────────────────
// React hook for uploading files.
// • If Firebase is configured → uploads to Firebase Storage, returns CDN URL
// • If not configured          → converts to base64 data URL (local preview)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { storage } from "./firebase";
import { FIREBASE_CONFIGURED } from "./useFirestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = (file, folder = "media") =>
    new Promise((resolve, reject) => {
      if (!file) return reject(new Error("No file provided"));

      setError(null);
      setUploading(true);
      setProgress(0);

      if (!FIREBASE_CONFIGURED) {
        // Fall back: read as data URL for local preview
        const reader = new FileReader();
        reader.onload = e => {
          setProgress(100);
          setUploading(false);
          resolve({
            url: e.target.result,
            type: file.type.startsWith("video") ? "video" : "image",
            name: file.name,
          });
        };
        reader.onerror = () => {
          setUploading(false);
          setError("File read failed");
          reject(new Error("File read failed"));
        };
        reader.readAsDataURL(file);
        return;
      }

      // Firebase Storage upload
      const ext  = file.name.split(".").pop();
      const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const storageRef = ref(storage, name);

      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: { originalName: file.name },
      });

      task.on(
        "state_changed",
        snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err  => { setUploading(false); setError(err.message); reject(err); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setUploading(false);
          setProgress(100);
          resolve({
            url,
            type: file.type.startsWith("video") ? "video" : "image",
            name: file.name,
          });
        }
      );
    });

  return { upload, progress, uploading, error };
}
