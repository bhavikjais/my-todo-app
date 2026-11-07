// Copy this file to js/firebase-config.js and fill in your values
// (Firebase console → Project settings → Your apps → Web app).
// js/firebase-config.js is git-ignored so your keys never reach GitHub.
// If the file is missing, or apiKey starts with "YOUR_", the app runs in LOCAL mode (no sharing / live sync).
// storageBucket is omitted on purpose: attachments are stored in Firestore, not Cloud Storage.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
