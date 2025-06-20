// convertServiceAccount.js
import fs from 'fs';

// Caminho do seu arquivo .json baixado do Firebase
const caminhoJson = './leilaoouro-firebase-adminsdk-fbsvc-e5308e5c24.json';

// Lê o JSON
const raw = fs.readFileSync(caminhoJson, 'utf8');
const json = JSON.parse(raw);

// Converte a chave privada para string de uma linha com \\n
const privateKeySingleLine = json.private_key.replace(/\n/g, '\\n');

// Monta as variáveis de ambiente
const env = `
FIREBASE_PROJECT_ID=${json.project_id}
FIREBASE_PRIVATE_KEY_ID=${json.private_key_id}
FIREBASE_PRIVATE_KEY="${privateKeySingleLine}"
FIREBASE_CLIENT_EMAIL=${json.client_email}
FIREBASE_CLIENT_ID=${json.client_id}
FIREBASE_CLIENT_CERT_URL=${json.client_x509_cert_url}
`.trim();

// Salva o arquivo .env.firebase (ou copie para o seu .env manualmente)
fs.writeFileSync('./.env.firebase', env);

console.log('✅ Arquivo .env.firebase gerado com sucesso!');
