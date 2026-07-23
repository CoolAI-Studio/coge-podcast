import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export const getAnalyticsInstance = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  } catch (e) {
    console.warn("Analytics not supported");
  }
  return null;
};
