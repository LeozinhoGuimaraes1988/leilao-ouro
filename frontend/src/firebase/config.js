import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBredGOLrSNPvffIp1UzPQvKGqeklUugNw',
  authDomain: 'leilaoouro.firebaseapp.com',
  projectId: 'leilaoouro',
  storageBucket: 'leilaoouro.firebasestorage.app',
  messagingSenderId: '26620011671',
  appId: '1:26620011671:web:5076273fdc3dcd5c88b5d2',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);
// Initialize Firebase

export { app, db, storage, auth };
