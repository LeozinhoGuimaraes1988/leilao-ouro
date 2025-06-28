import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  console.log('📝 Usando variáveis de ambiente para credenciais');

  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  };
} else {
  console.log('📄 Carregando arquivo firebase-adminsdk.json');

  const serviceAccountPath = path.join(
    __dirname,
    '../firebase/firebase-adminsdk.json'
  );

  serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));
}

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

// export async function salvarLotes(loteData) {
//   const ref = db.collection('lotes');
//   const batchSize = 500;

//   for (let i = 0; i < loteData.length; i += batchSize) {
//     const batch = db.batch();
//     const grupo = loteData.slice(i, i + batchSize);

//     grupo.forEach((item) => {
//       const docRef = ref.doc(); // Cria um novo documento com ID automático
//       batch.set(docRef, item);
//     });

//     await batch.commit(); // Salva esse grupo de até 500
//     console.log(`✅ Batch ${i / batchSize + 1} salvo com ${grupo.length} documentos`);
//   }
// }
