import express from 'express';
import { db } from '../firebase/firebaseAdmin.js';
// import db from '../functions/firebase/firebaseAdmin.js'; // Importando o db do Firebase Admin

const router = express.Router();

// 🔹 GET /cotacao - retorna as configurações salvas
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('configuracoes').doc('percentuais').get();

    if (!doc.exists) {
      return res.status(404).json({ erro: 'Configuração não encontrada' });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Erro ao buscar configurações de cotação:', error);
    res.status(500).json({ erro: 'Erro ao buscar configurações' });
  }
});

// 🔹 PUT /cotacao - atualiza as configurações (manual ou valores por tipo)
router.put('/', async (req, res) => {
  try {
    const {
      cotacaoManual,
      ouro750,
      ouroBaixo,
      pecaComDiamante,
      modoCotacao = 'manual',
    } = req.body;

    const novaConfig = {
      ...(cotacaoManual !== undefined && { cotacaoManual }),
      ...(ouro750 !== undefined && { ouro750 }),
      ...(ouroBaixo !== undefined && { ouroBaixo }),
      ...(pecaComDiamante !== undefined && { pecaComDiamante }),
      modoCotacao,
      atualizadoEm: new Date().toISOString(),
    };

    await db
      .collection('configuracoes')
      .doc('percentuais')
      .set(novaConfig, { merge: true });

    res.json({ sucesso: true, configuracoesAtualizadas: novaConfig });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ erro: 'Erro ao salvar configurações' });
  }
});

export default router;
