import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

console.log('🔄 Iniciando servidor Express...');

const app = express();

// Middleware básico
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl}`);
  console.log('📋 Content-Type:', req.headers['content-type']);
  next();
});

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 🔧 CORREÇÃO: NÃO usar express.json() para multipart
// Deixar o multer handle completamente o multipart/form-data
app.use((req, res, next) => {
  const contentType = req.headers['content-type'];

  // Se for multipart/form-data, PULA TODOS os middlewares de parsing
  if (contentType && contentType.startsWith('multipart/form-data')) {
    console.log('📁 Detectado multipart/form-data - pulando parsing');
    return next();
  }

  // Apenas para JSON
  if (contentType && contentType.includes('application/json')) {
    express.json({ limit: '50mb' })(req, res, next);
  } else {
    next();
  }
});

// Middleware adicional para debugging de uploads
app.use('/pdf', (req, res, next) => {
  console.log('🔍 DEBUG PDF Route:');
  console.log('- Method:', req.method);
  console.log('- Content-Type:', req.headers['content-type']);
  console.log('- Content-Length:', req.headers['content-length']);
  next();
});

// Rotas básicas
app.get('/', (req, res) => {
  console.log('✅ Rota raiz acessada');
  res.json({
    message: 'API pronta 🚀',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /status',
      'GET /pdf/test',
      'POST /pdf/importar-pdf',
      'GET /api/test-firestore',
      'GET /cotacao',
      'GET /lotes',
      'GET /configuracoes-cotacao',
    ],
  });
});

app.get('/status', (req, res) => {
  console.log('✅ Rota status acessada');
  res.status(200).json({
    status: 'ok',
    message: 'API funcionando! 🚀',
    timestamp: new Date().toISOString(),
  });
});

console.log('🔗 Carregando e registrando rotas...');

// Carregamento das rotas com try/catch
try {
  console.log('📦 Carregando testFirestoreRoutes...');
  const testFirestoreRoutes = await import('./routes/testFirestore.js');
  app.use('/api/test-firestore', testFirestoreRoutes.default);
  console.log('✅ testFirestoreRoutes registrado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar testFirestoreRoutes:', error.message);
}

try {
  console.log('📦 Carregando cotacaoRoutes...');
  const cotacaoRoutes = await import('./routes/cotacaoRoute.js');
  app.use('/cotacao', cotacaoRoutes.default);
  console.log('✅ cotacaoRoutes registrado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar cotacaoRoutes:', error.message);
}

try {
  console.log('📦 Carregando lotesRoutes...');
  const lotesRoutes = await import('./routes/lotesRoute.js');
  app.use('/lotes', lotesRoutes.default);
  console.log('✅ lotesRoutes registrado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar lotesRoutes:', error.message);
}

try {
  console.log('📦 Carregando configuracoesRoutes...');
  const configuracoesRoutes = await import('./routes/configuracoesRoutes.js');
  app.use('/configuracoes-cotacao', configuracoesRoutes.default);
  console.log('✅ configuracoesRoutes registrado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar configuracoesRoutes:', error.message);
}

try {
  console.log('📦 Carregando importPdfRouter...');
  const importPdfRouter = await import('./routes/importPdf.js');
  app.use('/pdf', importPdfRouter.default);
  console.log('✅ importPdfRouter registrado com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar importPdfRouter:', error.message);
}

// Middleware 404
app.use((req, res, next) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    method: req.method,
    url: req.originalUrl,
    message: 'Esta rota não existe nesta API',
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('💥 Erro capturado:', error);
  console.error('💥 Stack:', error.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message,
  });
});

console.log('🚀 Servidor Express configurado com sucesso!');

export default app;
