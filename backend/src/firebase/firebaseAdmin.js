// import { initializeApp, cert } from 'firebase-admin/app';
// import { getFirestore } from 'firebase-admin/firestore';
// import { config } from '../config/index.js';

// const adminConfig = config.firebaseAdmin;

// if (
//   !adminConfig.privateKey ||
//   !adminConfig.projectId ||
//   !adminConfig.clientEmail
// ) {
//   throw new Error('❌ Configurações do Firebase Admin incompletas.');
// }

// const serviceAccount = {
//   type: 'service_account',
//   project_id: adminConfig.projectId,
//   private_key_id: adminConfig.privateKeyId,
//   private_key: adminConfig.privateKey,
//   client_email: adminConfig.clientEmail,
//   client_id: adminConfig.clientId,
//   auth_uri: 'https://accounts.google.com/o/oauth2/auth',
//   token_uri: 'https://oauth2.googleapis.com/token',
//   auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
//   client_x509_cert_url: adminConfig.clientCertUrl,
// };

// initializeApp({ credential: cert(serviceAccount) });

// const db = getFirestore();

// export { db };

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar se as configurações estão completas
const { firebaseAdmin } = config;

// Tentar usar arquivo JSON primeiro, depois variáveis de ambiente
let serviceAccount;

// Procurar por arquivo de credenciais JSON
const possiblePaths = [
  path.join(__dirname, '../firebase-credentials.json'),
  path.join(__dirname, './firebase-adminsdk.json'), // mesmo diretório
  path.join(__dirname, '../firebase-adminsdk.json'),
  path.join(__dirname, '../../firebase-credentials.json'),
  path.join(__dirname, '../../../firebase-credentials.json'),
  path.join(__dirname, '../serviceAccountKey.json'),
  path.join(__dirname, '../../serviceAccountKey.json'),
];

let credentialsFound = false;

for (const credPath of possiblePaths) {
  try {
    if (fs.existsSync(credPath)) {
      console.log('📁 Encontrado arquivo de credenciais:', credPath);
      const credentialsData = fs.readFileSync(credPath, 'utf8');
      serviceAccount = JSON.parse(credentialsData);
      credentialsFound = true;
      break;
    }
  } catch (error) {
    console.log('❌ Erro ao ler arquivo:', credPath, error.message);
  }
}

// Se não encontrou arquivo JSON, usar variáveis de ambiente
if (!credentialsFound) {
  console.log('📝 Usando variáveis de ambiente para credenciais');

  if (
    !firebaseAdmin?.privateKey ||
    !firebaseAdmin?.projectId ||
    !firebaseAdmin?.clientEmail
  ) {
    console.error(
      '🔴 Configurações do Firebase Admin incompletas:',
      firebaseAdmin
    );
    throw new Error(
      '❌ Configurações do Firebase Admin incompletas. Verifique as variáveis de ambiente ou crie um arquivo firebase-credentials.json'
    );
  }

  // Tentar diferentes formas de limpar a chave privada
  let cleanPrivateKey = firebaseAdmin.privateKey;

  // Método 1: Simples substituição
  cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');

  // Método 2: Se ainda não funcionar, tentar limpeza mais agressiva
  if (cleanPrivateKey.includes('\\n')) {
    cleanPrivateKey = cleanPrivateKey.split('\\n').join('\n');
  }

  // Método 3: Remover espaços extras no início e fim de cada linha
  cleanPrivateKey = cleanPrivateKey
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  serviceAccount = {
    type: 'service_account',
    project_id: firebaseAdmin.projectId,
    private_key_id: firebaseAdmin.privateKeyId,
    private_key: cleanPrivateKey,
    client_email: firebaseAdmin.clientEmail,
    client_id: firebaseAdmin.clientId,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: firebaseAdmin.clientCertUrl,
  };
}

// Log para debug (remova em produção)
console.log('🔧 Firebase Admin Config:', {
  project_id: serviceAccount.project_id,
  client_email: serviceAccount.client_email,
  has_private_key: !!serviceAccount.private_key,
  private_key_length: serviceAccount.private_key?.length,
  using_json_file: credentialsFound,
});

try {
  initializeApp({ credential: cert(serviceAccount) });
  console.log('✅ Firebase Admin inicializado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);

  // Se ainda falhar, sugerir usar arquivo JSON
  if (!credentialsFound) {
    console.log(`
🔧 SUGESTÃO: Para evitar problemas com formatação da chave privada, 
crie um arquivo 'firebase-credentials.json' na pasta backend/ com o 
conteúdo do arquivo JSON que você baixou do Firebase Console.
    `);
  }

  throw error;
}

const db = getFirestore();

export { db };
