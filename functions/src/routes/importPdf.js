import express from 'express';
import multer from 'multer';
import admin from 'firebase-admin';
import { salvarLotes } from '../services/firebaseService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔥 ARQUIVO importPdf.js CARREGADO!');
console.log('🚀 PDF Router ativo e carregado!');

const router = express.Router();

// Configuração do multer para Firebase Functions
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    console.log('📎 Arquivo recebido:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos!'), false);
    }
  },
});

// 🔧 DEBUGGING: Middleware SEGURO para verificar dados (SEM consumir stream)
const debugMiddleware = (req, res, next) => {
  console.log('🔍 DEBUG ANTES DO MULTER:');
  console.log('- Method:', req.method);
  console.log('- URL:', req.url);
  console.log('- Content-Type:', req.headers['content-type']);
  console.log('- Content-Length:', req.headers['content-length']);
  console.log('- Headers importantes:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent'],
  });

  // ❌ REMOVIDO: req.on('data') que estava consumindo o stream
  // ✅ MANTIDO: Apenas logs dos headers (que não consomem o stream)

  next();
};

// 🔧 CORREÇÃO: Wrapper para tratar erros do multer
const uploadWrapper = (req, res, next) => {
  console.log('🔧 Iniciando uploadWrapper...');

  upload.single('pdf')(req, res, (error) => {
    console.log('📤 Callback do multer executado');
    console.log('- Error:', error);
    console.log('- File:', !!req.file);
    console.log('🔎 req.headers:', req.headers);
    // req.on('data', (chunk) => console.log('📦 CHUNK RECEBIDO:', chunk.length));

    if (error instanceof multer.MulterError) {
      console.error('❌ Erro do Multer:', error);
      console.error('- Code:', error.code);
      console.error('- Message:', error.message);
      console.error('- Field:', error.field);

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Arquivo muito grande. Máximo permitido: 10MB',
        });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Campo de arquivo inválido. Use o campo "pdf"',
        });
      }
      return res.status(400).json({
        sucesso: false,
        erro: `Erro no upload: ${error.message}`,
        debug: {
          code: error.code,
          field: error.field,
        },
      });
    }

    if (error) {
      console.error('❌ Erro no upload:', error);
      console.error('- Name:', error.name);
      console.error('- Message:', error.message);
      console.error('- Stack:', error.stack);

      if (error.message === 'Apenas arquivos PDF são permitidos!') {
        return res.status(400).json({
          sucesso: false,
          erro: 'Apenas arquivos PDF são permitidos!',
        });
      }
      return res.status(400).json({
        sucesso: false,
        erro: `Erro no upload: ${error.message}`,
        debug: {
          name: error.name,
          message: error.message,
        },
      });
    }

    console.log('✅ Upload bem-sucedido, prosseguindo...');
    next();
  });
};

// Rota principal de importação - 🔧 CORRIGIDA SEM DEBUG QUE CONSOME STREAM
router.post(
  '/importar-pdf',
  debugMiddleware, // Agora seguro
  uploadWrapper,
  async (req, res) => {
    console.log('📎 Requisição recebida em /importar-pdf');
    console.log('📥 Headers importantes:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
    });
    console.log('🧪 File presente:', !!req.file);

    if (!req.file) {
      console.error('❌ Nenhum arquivo foi enviado.');
      return res.status(400).json({
        sucesso: false,
        erro: 'Nenhum arquivo PDF foi enviado.',
        debug: {
          contentType: req.headers['content-type'],
          hasFile: !!req.file,
        },
      });
    }

    try {
      // Import dinâmico do pdf-parse (necessário para Firebase Functions)
      const { default: pdf } = await import('pdf-parse');
      const buffer = req.file.buffer;

      console.log('📄 Processando PDF:', {
        nome: req.file.originalname,
        tamanho: buffer.length,
        tipo: req.file.mimetype,
      });

      console.log('🔍 Extraindo conteúdo do PDF...');

      // Processamento do PDF com timeout
      const data = await Promise.race([
        pdf(buffer),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Timeout ao processar PDF (30s)')),
            30000
          )
        ),
      ]);

      const texto = data.text;
      console.log('📝 Texto extraído:', {
        tamanho: texto.length,
        primeiros100: texto.substring(0, 100).replace(/\n/g, ' '),
      });

      if (!texto || texto.trim().length === 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'O PDF parece estar vazio ou ilegível.',
          debug: {
            pdfInfo: data.info,
            numPages: data.numpages,
          },
        });
      }

      // Regex para extrair lotes (mais flexível)
      const regex =
        /(?<lote>0\d{3}\.\d{6,}-\d)[\s\S]*?(?<descricao>.+?)\s+R\$\s*(?<valor>[\d.,]+)/gs;
      const lotes = [];
      const limiteImportacao = 1000;

      let match;
      let tentativas = 0;
      const maxTentativas = 2000;

      while (
        (match = regex.exec(texto)) !== null &&
        lotes.length < limiteImportacao &&
        tentativas < maxTentativas
      ) {
        tentativas++;

        try {
          // Limpa e converte o valor
          const valorLimpo = match.groups.valor
            .replace(/\./g, '') // Remove pontos (milhares)
            .replace(',', '.'); // Troca vírgula por ponto

          const valorNumerico = parseFloat(valorLimpo);

          if (isNaN(valorNumerico) || valorNumerico <= 0) {
            console.warn('⚠️ Valor inválido:', match.groups.valor);
            continue;
          }

          const descricao = match.groups.descricao
            .trim()
            .replace(/\s+/g, ' ')
            .substring(0, 500); // Limita tamanho da descrição

          // Extração do peso
          const pesoMatch = descricao.match(/peso\s+lote[:\s]*([\d,.]+)\s*g?/i);
          const pesoExtraido = pesoMatch?.[1]
            ? parseFloat(pesoMatch[1].replace(',', '.')) || 0
            : 0;

          lotes.push({
            numeroLote: match.groups.lote.trim(),
            descricao,
            classificacao: '',
            valor: valorNumerico,
            lance: 0,
            percentualExtra: 6,
            totalComPercentual: 0,
            descontoPesoPedra: 0,
            pesoLote: pesoExtraido,
            pesoReal: 0,
            valorFinalPorGrama: 0,
            cotacaoBase: '',
            estimativaGanho: 0,
            criadoEm: new Date(),
            importadoEm: new Date(),
            arquivoOriginal: req.file.originalname,
          });

          // Log a cada 50 lotes processados
          if (lotes.length % 50 === 0) {
            console.log(`📊 ${lotes.length} lotes processados...`);
          }
        } catch (itemError) {
          console.warn('⚠️ Erro ao processar item:', itemError.message);
          continue;
        }
      }

      console.log(
        `🔍 Processamento concluído: ${tentativas} tentativas, ${lotes.length} lotes found`
      );

      if (lotes.length === 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nenhum lote foi encontrado no PDF. Verifique o formato.',
          debug: {
            textoTamanho: texto.length,
            tentativasRegex: tentativas,
            amostraTexto: texto.substring(0, 500),
          },
        });
      }

      console.log(
        `✅ ${lotes.length} lotes extraídos, salvando no Firestore...`
      );

      // Salvar no Firestore
      await salvarLotes(lotes);

      console.log('💾 Lotes salvos com sucesso!');

      res.json({
        sucesso: true,
        totalInseridos: lotes.length,
        mensagem: `${lotes.length} lotes importados com sucesso!`,
        arquivo: req.file.originalname,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      console.error('Stack:', error.stack);

      res.status(500).json({
        sucesso: false,
        erro: `Erro ao processar o PDF: ${error.message}`,
        detalhes:
          process.env.NODE_ENV === 'development'
            ? {
                stack: error.stack,
                name: error.name,
              }
            : undefined,
      });
    }
  }
);

// Rota para listar lotes
router.get('/lotes', async (req, res) => {
  try {
    console.log('📋 Buscando lotes no Firestore...');

    const snapshot = await admin
      .firestore()
      .collection('lotes')
      .orderBy('criadoEm', 'desc')
      .limit(100)
      .get();
    const lotes = [];

    snapshot.forEach((doc) => {
      lotes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`📊 ${lotes.length} lotes encontrados`);

    res.json({
      sucesso: true,
      total: lotes.length,
      lotes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao buscar lotes:', error);
    res.status(500).json({
      sucesso: false,
      erro: 'Erro ao buscar lotes do Firestore',
      detalhes: error.message,
    });
  }
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Rota de importação PDF funcionando!',
    timestamp: new Date().toISOString(),
    firebase: !!admin.apps.length,
    environment: process.env.NODE_ENV || 'development',
  });
});

console.log('🔥 ROUTER importPdf.js CRIADO COM SUCESSO!');

export default router;
