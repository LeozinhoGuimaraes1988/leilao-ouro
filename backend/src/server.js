import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Apenas carrega .env localmente (não afeta deploy)
// if (process.env.NODE_ENV !== 'production') {
//   dotenv.config();
// }
dotenv.config();

import testFirestoreRoutes from './routes/testFirestore.js';
import cotacaoRoutes from './routes/cotacaoRoute.js';
import lotesRoutes from './routes/lotesRoute.js';
import configuracoesRoutes from './routes/configuracoesRoutes.js';
import importPdfRouter from './routes/importPdf.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API pronta 🚀');
});

app.use('/api/configuracoes-cotacao', configuracoesRoutes);
app.use('/api/lotes', lotesRoutes);
app.use('/api/test-firestore', testFirestoreRoutes);
app.use('/api', cotacaoRoutes);
app.use('/api', importPdfRouter);

app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API funcionando! 🚀' });
});

// 🔥 NUNCA usar app.listen() no Firebase Functions
// export apenas o app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

export default app;
