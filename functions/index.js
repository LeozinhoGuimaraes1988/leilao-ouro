import functions from 'firebase-functions';
import app from '../backend/src/server.js';

export const api = functions.https.onRequest(app);

// import functions from 'firebase-functions';
// import app from './src/server.js';

// export const api = functions.https.onRequest((req, res) => {
//   if (req.url.startsWith('/api')) {
//     req.url = req.url.replace(/^\/api/, '');
//   }

//   return app(req, res);
// });
