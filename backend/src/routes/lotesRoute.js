import express from 'express';
import { db } from '../firebase/firebaseAdmin.js';
import { Timestamp } from 'firebase-admin/firestore';

const router = express.Router();

/** Healthcheck para o detectApiBase do front */
router.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

/** CRIAR LOTE */
router.post('/', async (req, res) => {
  try {
    const {
      numeroLote,
      descricao,
      classificacao,
      valor,
      lance,
      percentualExtra,
      descontoPesoPedra,
      pesoLote,
    } = req.body;

    const pesoReal = pesoLote - descontoPesoPedra;
    const totalComPercentual = lance + lance * (percentualExtra / 100);
    const valorFinalPorGrama = pesoReal > 0 ? totalComPercentual / pesoReal : 0;

    const configDoc = await db
      .collection('configuracoes')
      .doc('percentuais')
      .get();
    const { modoCotacao, cotacaoManual } = configDoc.data();
    const cotacaoBase =
      modoCotacao === 'manual' ? parseFloat(cotacaoManual) : 573.97;

    const estimativaGanho =
      cotacaoBase && pesoReal > 0
        ? cotacaoBase * pesoReal - totalComPercentual
        : null;

    const novoLote = {
      numeroLote,
      descricao,
      classificacao,
      valor,
      lance,
      percentualExtra,
      totalComPercentual,
      descontoPesoPedra,
      pesoLote,
      pesoReal,
      valorFinalPorGrama,
      cotacaoBase,
      estimativaGanho,
      criadoEm: Timestamp.now(),
      atualizadoEm: Timestamp.now(),
    };

    const docRef = await db.collection('lotes').add(novoLote);
    res.status(201).json({ sucesso: true, id: docRef.id, lote: novoLote });
  } catch (error) {
    console.error('❌ Erro ao salvar lote:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

/** LISTAR LOTES (com total) */
router.get('/', async (req, res) => {
  try {
    const configDoc = await db
      .collection('configuracoes')
      .doc('percentuais')
      .get();
    const { modoCotacao, cotacaoManual } = configDoc.data();
    const cotacaoBase =
      modoCotacao === 'manual' ? parseFloat(cotacaoManual) : 573.97;

    const snapshot = await db
      .collection('lotes')
      .orderBy('criadoEm', 'desc')
      .get();

    const lotes = snapshot.docs.map((doc) => {
      const lote = doc.data();
      const estimativaGanho =
        lote.pesoReal && cotacaoBase
          ? lote.pesoReal * cotacaoBase - lote.totalComPercentual
          : 0;

      return {
        id: doc.id,
        ...lote,
        cotacaoBase,
        estimativaGanho,
      };
    });

    res.json({ sucesso: true, total: snapshot.size, lotes });
  } catch (error) {
    console.error('Erro ao buscar lotes:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

/** ⛏️ EXCLUIR MÚLTIPLOS (ids no body) — precisa vir ANTES de '/:id' */
router.post('/excluir-multiplos', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ sucesso: false, erro: 'Nenhum ID fornecido' });
  }

  const batch = db.batch();

  try {
    for (const id of ids) {
      const ref = db.collection('lotes').doc(id);
      batch.delete(ref);
    }

    await batch.commit();
    res.json({ sucesso: true, excluidos: ids.length });
  } catch (error) {
    console.error('Erro ao excluir múltiplos lotes:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro ao excluir lotes' });
  }
});

/** 💣 EXCLUIR TODOS — precisa vir ANTES de '/:id' */
router.delete('/excluir-todos', async (req, res) => {
  try {
    const col = db.collection('lotes');
    const BATCH_SIZE = 400; // < 500
    let excluidos = 0;

    while (true) {
      const snap = await col.limit(BATCH_SIZE).get();
      if (snap.empty) break;

      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      excluidos += snap.size;
      console.log(`🔥 batch apagado: ${snap.size} | total=${excluidos}`);
    }

    return res.json({ sucesso: true, excluidos });
  } catch (err) {
    console.error('Erro ao excluir todos os lotes:', err);
    return res
      .status(500)
      .json({ sucesso: false, erro: 'Erro ao excluir todos os lotes' });
  }
});

/** EDITAR LOTE (/:id) — deixar DEPOIS das rotas específicas */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ref = db.collection('lotes').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return res
        .status(404)
        .json({ sucesso: false, erro: 'Lote não encontrado' });
    }
    const atual = snap.data();

    const toNum = (v, fallback) => {
      if (v === undefined || v === null || v === '') return fallback;
      const n = Number(String(v).replace(',', '.'));
      return Number.isNaN(n) ? fallback : n;
    };

    const {
      numeroLote,
      classificacao,
      lance,
      percentualExtra,
      descontoPesoPedra,
      pesoLote,
    } = req.body;

    const merged = {
      numeroLote: numeroLote ?? atual.numeroLote,
      classificacao: classificacao ?? atual.classificacao,
      lance: toNum(lance, toNum(atual.lance, 0)),
      percentualExtra: toNum(percentualExtra, toNum(atual.percentualExtra, 6)),
      descontoPesoPedra: toNum(
        descontoPesoPedra,
        toNum(atual.descontoPesoPedra, 0)
      ),
      pesoLote: toNum(pesoLote, toNum(atual.pesoLote, 0)),
    };

    const configDoc = await db
      .collection('configuracoes')
      .doc('percentuais')
      .get();
    const { modoCotacao, cotacaoManual } = configDoc.data();
    const cotacaoBase =
      modoCotacao === 'manual' ? Number(cotacaoManual) : 573.97;

    const pesoReal = merged.pesoLote - merged.descontoPesoPedra;
    const totalComPercentual =
      merged.lance + merged.lance * (merged.percentualExtra / 100);
    const valorFinalPorGrama = pesoReal > 0 ? totalComPercentual / pesoReal : 0;
    const estimativaGanho =
      cotacaoBase && pesoReal > 0
        ? cotacaoBase * pesoReal - totalComPercentual
        : 0;

    const loteAtualizado = {
      ...atual,
      ...merged,
      pesoReal,
      totalComPercentual,
      valorFinalPorGrama,
      cotacaoBase,
      estimativaGanho,
      atualizadoEm: Timestamp.now(),
    };

    await ref.set(loteAtualizado, { merge: true });

    return res.json({ sucesso: true, id, loteAtualizado });
  } catch (error) {
    console.error('Erro ao editar lote:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

/** EXCLUIR LOTE UNITÁRIO (/:id) — deixar POR ÚLTIMO */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('lotes').doc(id).delete();
    res.json({ sucesso: true, mensagem: `Lote ${id} excluído com sucesso.` });
  } catch (error) {
    console.error('Erro ao excluir lote:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

// GET /lotes/buscar?

router.get('/buscar', async (req, res) => {
  try {
    const termo = String(req.query.termo || '').replace(/\D/g, '');
    if (!termo) return res.json({ sucesso: true, lotes: [] });

    // Pega todos os lotes (cuidado: pode ser pesado se houver muitos!)
    const snap = await db.collection('lotes').get();

    const lotes = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((l) => {
        const normalizado = String(l.numeroLote || '').replace(/\D/g, '');
        return normalizado.includes(termo);
      });

    res.json({ sucesso: true, lotes });
  } catch (err) {
    console.error('Erro ao buscar lotes:', err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

export default router;
