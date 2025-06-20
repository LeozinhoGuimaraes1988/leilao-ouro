// import functions from 'firebase-functions';
// import app from './src/server.js';

// export const api = functions.https.onRequest(app);

import functions from 'firebase-functions';
import app from './src/server.js';

// ⚠️ Adicione isso ANTES de passar o req para o Express
export const api = functions.https.onRequest((req, res) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }

  // ⚠️ Impede o Firebase de tentar fazer parsing automático:
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    console.log(
      '📁 multipart/form-data detectado — desativando parsing automático'
    );
    delete req.body; // força ignorar qualquer body parseado
  }

  return app(req, res);
});
