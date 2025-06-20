// backend/scripts/deleteLotes.js
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho até o JSON de credenciais
const serviceAccountPath = path.join(
  __dirname,
  '../firebase/firebase-adminsdk.json'
);
const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'));

// Inicializa o Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function excluirTodosMenosDois() {
  const snapshot = await db.collection('lotes').orderBy('criadoEm').get();

  if (snapshot.empty) {
    console.log('📭 Nenhum lote encontrado.');
    return;
  }

  const lotes = snapshot.docs;

  if (lotes.length <= 2) {
    console.log('✅ Menos de 3 lotes encontrados. Nada a excluir.');
    return;
  }

  const batch = db.batch();

  // Começa a deletar do terceiro em diante
  for (let i = 2; i < lotes.length; i++) {
    batch.delete(lotes[i].ref);
  }

  await batch.commit();
  console.log(
    `🧹 ${lotes.length - 2} lote(s) excluído(s), mantendo os 2 primeiros.`
  );
}

excluirTodosMenosDois().catch((err) => {
  console.error('Erro ao excluir lotes:', err);
});
