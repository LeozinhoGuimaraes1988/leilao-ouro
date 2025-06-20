import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(
  __dirname,
  '../firebase/firebase-adminsdk.json'
);

const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export async function salvarLotes(loteData) {
  const ref = db.collection('lotes');
  const batch = db.batch();

  loteData.forEach((item) => {
    const docRef = ref.doc(); // Cria um novo documento com ID gerado automaticamente
    batch.set(docRef, item);
  });

  await batch.commit();
}
