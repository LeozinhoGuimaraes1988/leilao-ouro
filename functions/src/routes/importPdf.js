import express from 'express';
import multer from 'multer';
import admin from 'firebase-admin';
import { salvarLotes } from '../services/firebaseService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔥 ARQUIVO importPdf.js CARREGADO COM MULTER!');

const router = express.Router();

// 📦 Configuração do Multer com armazenamento em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    console.log('📎 Arquivo recebido no filtro:', {
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

router.post('/importar-pdf', (req, res) => {
  console.log('🔔 [POST] /importar-pdf chamada');
  console.log('🧪 Headers:', req.headers);
  console.log('🧪 Método:', req.method);

  upload.single('pdf')(req, res, async (error) => {
    console.log('📤 Callback do multer executado');
    console.log('🧾 req.file:', req.file);
    console.log('🧾 req.body:', req.body);

    if (error instanceof multer.MulterError) {
      console.error('❌ Erro do Multer:', error);
      return res.status(400).json({
        sucesso: false,
        erro: `Erro no upload: ${error.message}`,
      });
    }

    if (error) {
      console.error('❌ Erro genérico no upload:', error);
      return res.status(400).json({
        sucesso: false,
        erro: error.message,
      });
    }

    if (!req.file) {
      console.error('❌ Nenhum arquivo encontrado em req.file');
      return res.status(400).json({
        sucesso: false,
        erro: 'Nenhum arquivo PDF foi enviado.',
      });
    }

    try {
      const { default: pdf } = await import('pdf-parse');
      const buffer = req.file.buffer;

      console.log('📄 Iniciando extração do PDF...');
      const data = await pdf(buffer);

      const texto = data.text;
      console.log('📝 Primeiros 300 caracteres extraídos:');
      console.log(texto.slice(0, 300));

      if (!texto || texto.trim().length === 0) {
        console.warn('⚠️ Texto vazio no PDF');
        return res.status(400).json({
          sucesso: false,
          erro: 'O PDF parece estar vazio ou ilegível.',
        });
      }

      // REGEX DE LOTE
      const regex =
        /(?<lote>0\d{3}\.\d{6,}-\d)[\s\S]*?(?<descricao>.+?)\s+R\$\s*(?<valor>[\d.,]+)/gs;

      const lotes = [];
      let match;
      let tentativas = 0;

      while ((match = regex.exec(texto)) !== null && lotes.length < 1000) {
        tentativas++;
        try {
          const valor = parseFloat(
            match.groups.valor.replace(/\./g, '').replace(',', '.')
          );
          if (isNaN(valor) || valor <= 0) continue;

          const descricao = match.groups.descricao.trim().substring(0, 500);

          lotes.push({
            numeroLote: match.groups.lote,
            descricao,
            valor,
            criadoEm: new Date(),
            importadoEm: new Date(),
            arquivoOriginal: req.file.originalname,
          });
        } catch (e) {
          console.warn('⚠️ Erro ao processar item:', e.message);
        }
      }

      console.log(
        `✅ ${lotes.length} lotes extraídos em ${tentativas} tentativas`
      );

      if (lotes.length === 0) {
        return res.status(400).json({
          sucesso: false,
          erro: 'Nenhum lote foi encontrado.',
        });
      }

      await salvarLotes(lotes);
      console.log('💾 Lotes salvos com sucesso no Firestore!');

      res.json({
        sucesso: true,
        totalInseridos: lotes.length,
        mensagem: `${lotes.length} lotes importados com sucesso!`,
        arquivo: req.file.originalname,
      });
    } catch (err) {
      console.error('❌ Erro ao processar PDF:', err);
      res.status(500).json({
        sucesso: false,
        erro: 'Erro ao processar o PDF',
        detalhes: err.message,
      });
    }
  });
});

// Teste rápido
router.get('/test', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Rota de importação PDF funcionando (MULTER)',
    timestamp: new Date().toISOString(),
  });
});

export default router;
