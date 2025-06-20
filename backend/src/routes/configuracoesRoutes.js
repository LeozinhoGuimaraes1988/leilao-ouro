import express from 'express';
import { db } from '../firebase/firebaseAdmin.js';
// import db from '../functions/firebase/firebaseAdmin.js'; // Importando o db do Firebase Admin

const router = express.Router();
const docRef = db.collection('configuracoes').doc('cotacoes');

// GET /api/configuracoes-cotacao
router.get('/', async (req, res) => {
  try {
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    const data = doc.data();
    res.status(200).json({
      sucesso: true,
      modoCotacao: data.modoCotacao || 'tempoReal',
      cotacaoManual: data.cotacaoManual || null,
      valoresFixos: data.valoresFixos || {}, // <- Aqui mudamos de percentuais para valoresFixos
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

// PUT /api/configuracoes-cotacao
router.put('/', async (req, res) => {
  console.log('📥 Chegou uma requisição PUT em configuracoes-cotacao!');
  try {
    console.log('📥 Dados recebidos no PUT:', req.body);
    const { modoCotacao, cotacaoManual, valoresFixos } = req.body;

    if (
      !valoresFixos ||
      isNaN(valoresFixos.ouro750) ||
      isNaN(valoresFixos.ouroBaixo) ||
      isNaN(valoresFixos.pecaComDiamante)
    ) {
      return res
        .status(400)
        .json({ sucesso: false, erro: 'valoresFixos inválidos' });
    }

    console.log('🔍 Dados recebidos:', req.body);

    await docRef.set(
      {
        modoCotacao,
        cotacaoManual:
          modoCotacao === 'manual' ? parseFloat(cotacaoManual) : null,
        valoresFixos: {
          ouro750: parseFloat(valoresFixos.ouro750),
          ouroBaixo: parseFloat(valoresFixos.ouroBaixo),
          pecaComDiamante: parseFloat(valoresFixos.pecaComDiamante),
        },
        atualizadoEm: new Date().toISOString(),
      },
      { merge: true }
    );

    res.status(200).json({
      sucesso: true,
      mensagem: 'Configurações salvas com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

export default router;
