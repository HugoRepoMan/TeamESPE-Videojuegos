import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check
// This will throw a warning in dev mode if localhost isn't added to reCAPTCHA, but we allow it for now.
// For local development without reCAPTCHA, you would normally use CustomProvider or debug tokens.
let appCheck;
if (typeof window !== 'undefined') {
  // Use a placeholder key if it's not configured yet so the app doesn't crash completely.
  const reCaptchaKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || '6Ldummy-SiteKey-Please-Configure-reCAPTCHA';
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(reCaptchaKey),
    isTokenAutoRefreshEnabled: true
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { appCheck };
export default app;
