import express from 'express';
import multer from 'multer';
import admin from 'firebase-admin';
import { salvarLotes } from '../services/firebaseService.js';
import dotenv from 'dotenv';
import extrairTextoPdf from '../../libs/pdf-parse/index.js';

dotenv.config();

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/importar-pdf', upload.single('pdf'), async (req, res) => {
  console.log('📎 Requisição recebida em /importar-pdf');
  console.log('📥 Headers recebidos:', req.headers);
  console.log('🧪 req.file:', req.file);
  console.log('🧪 req.body:', req.body);

  if (!req.file) {
    console.error('❌ Nenhum arquivo foi enviado.');
    return res.status(400).json({
      sucesso: false,
      erro: 'Nenhum arquivo PDF foi enviado.',
    });
  }

  try {
    const buffer = req.file.buffer;

    console.log('🔍 Extraindo conteúdo do PDF...');
    const texto = await extrairTextoPdf(buffer);

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'O PDF parece estar vazio ou ilegível.',
      });
    }

    const regex =
      /(?<lote>\d{4}\.\d{6,}-\d(?:[\s\/]+\d{4}\.\d{3}\.\d{8}-\d)*)\s+(?<descricao>.+?)\s+R\$\s?(?<valor>[\d.]+,\d{2})/gs;

    const lotes = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
      const valorNumerico = parseFloat(
        match.groups.valor.replace(/\./g, '').replace(',', '.')
      );

      // 2) Limpeza: se a descrição começar com 1+ códigos extras, remove todos.
      //    (alguns PDFs repetem o código numa nova linha)
      const descricaoBruta = match.groups.descricao.trim().replace(/\s+/g, ' ');
      const descricao = descricaoBruta.replace(
        /^(?:\/?\s*\d{4}\.\d{3}\.\d{8}-\d\s*)+/,
        ''
      );

      const pesoMatch = descricao.match(/peso lote[:\s]*([\d,.]+)g?/i);
      const pesoExtraido = pesoMatch?.[1]
        ? parseFloat(pesoMatch[1].replace(',', '.')) || 0
        : 0;

      lotes.push({
        numeroLote: match.groups.lote.trim(), // agora inclui o(s) código(s) adicional(is), com ou sem "/"
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
      });
    }
    if (lotes.length === 0) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Nenhum lote foi encontrado no PDF. Verifique o formato.',
      });
    }

    console.log(`✅ ${lotes.length} lotes extraídos do PDF`);
    await salvarLotes(lotes);

    res.json({ sucesso: true, totalInseridos: lotes.length });
  } catch (error) {
    console.error('❌ Erro ao processar o PDF:', error);
    res.status(500).json({
      sucesso: false,
      erro: `Erro ao processar o PDF: ${error.message}`,
    });
  }
});

router.get('/lotes', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('lotes').get();
    const lotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ sucesso: true, total: lotes.length, lotes });
  } catch (error) {
    console.error('Erro ao buscar lotes:', error);
    res.status(500).json({ erro: 'Erro ao buscar lotes' });
  }
});

export default router;
