import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Especifica o caminho correto para o .env
const envPaths = [
  path.join(__dirname, '../.env'), // backend/.env
  path.join(__dirname, '../../.env'), // raiz/.env
  path.join(__dirname, '../../../.env'), // caso esteja mais acima
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log('✅ .env carregado de:', envPath);
      envLoaded = true;
      break;
    }
  } catch (error) {
    console.log('❌ Não encontrou .env em:', envPath);
  }
}

if (!envLoaded) {
  console.log('🔍 Tentando carregar .env do diretório de trabalho atual');
  dotenv.config();
}

// Debug
console.log('🔍 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('🔍 FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log(
  '🔍 FIREBASE_PRIVATE_KEY exists:',
  !!process.env.FIREBASE_PRIVATE_KEY
);

export const config = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },

  firebaseAdmin: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    clientCertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
  },
};
