// backend/routes/configuracoesCotacao.js
import express from 'express';
import { db } from '../firebase/firebaseAdmin.js';

const router = express.Router();
const docRef = db.collection('configuracoes').doc('cotacoes');

/* =============== Helpers =============== */
const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n) => Math.round(n * 100) / 100;

const sanitize = (obj = {}) => ({
  ouro750: toNum(obj.ouro750, 0),
  ouroBaixo: toNum(obj.ouroBaixo, 0),
  pecaComDiamante: toNum(obj.pecaComDiamante, 0),
});

const DEFAULTS = {
  sucesso: true,
  modoCotacao: 'manual',
  tipoDefinicao: 'valores', // 'percentuais' | 'valores'
  cotacaoManual: 0,
  valoresManuais: { ouro750: 0, ouroBaixo: 0, pecaComDiamante: 0 },
  valoresPercentuais: { ouro750: 0, ouroBaixo: 0, pecaComDiamante: 0 },
  percentuais: { ouro750: 0, ouroBaixo: 0, pecaComDiamante: 0 },
};
/* ====================================== */

/** GET /api/configuracoes-cotacao */
router.get('/', async (_req, res) => {
  try {
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(200).json(DEFAULTS);
    }

    const data = snap.data() || {};
    res.status(200).json({
      sucesso: true,
      modoCotacao: data.modoCotacao ?? DEFAULTS.modoCotacao,
      tipoDefinicao: data.tipoDefinicao ?? DEFAULTS.tipoDefinicao,
      cotacaoManual: toNum(data.cotacaoManual, DEFAULTS.cotacaoManual),
      valoresManuais: sanitize(data.valoresManuais),
      valoresPercentuais: sanitize(data.valoresPercentuais),
      percentuais: sanitize(data.percentuais),
    });
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

/** PUT /api/configuracoes-cotacao */
router.put('/', async (req, res) => {
  try {
    const {
      modoCotacao,
      tipoDefinicao,
      cotacaoManual: cotacaoManualBody,
      valoresManuais,
      valoresPercentuais,
      percentuais,
    } = req.body;

    const novaConfig = {
      modoCotacao: modoCotacao ?? DEFAULTS.modoCotacao,
      tipoDefinicao: ['percentuais', 'valores'].includes(tipoDefinicao)
        ? tipoDefinicao
        : DEFAULTS.tipoDefinicao,
      cotacaoManual: toNum(cotacaoManualBody, 0),
      valoresManuais: sanitize(valoresManuais),
      valoresPercentuais: sanitize(valoresPercentuais),
      percentuais: sanitize(percentuais),
      atualizadoEm: new Date().toISOString(),
    };

    await docRef.set(novaConfig, { merge: true });

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Configurações salvas com sucesso',
      configuracoes: novaConfig,
    });
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

export default router;
