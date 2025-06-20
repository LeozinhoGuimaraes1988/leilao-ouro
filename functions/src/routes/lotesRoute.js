import express from 'express';
import { db } from '../firebase/firebaseAdmin.js';
import { Timestamp } from 'firebase-admin/firestore';

const router = express.Router();

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

    // ✅ REMOVIDO as linhas de console.error que estavam no lugar errado

    const pesoReal = pesoLote - descontoPesoPedra;
    const totalComPercentual = lance + lance * (percentualExtra / 100);
    const valorFinalPorGrama = pesoReal > 0 ? totalComPercentual / pesoReal : 0;

    // Cotação (usa valor fixo ou configurações externas)
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
    // ✅ AQUI SIM é o lugar correto para o console.error
    console.error('❌ Erro ao salvar lote:', error.message);
    console.error(error.stack);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

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

    res.json({ sucesso: true, lotes });
  } catch (error) {
    console.error('Erro ao buscar lotes:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numeroLote,
      classificacao,
      lance,
      percentualExtra,
      descontoPesoPedra,
      pesoLote,
    } = req.body;

    const configDoc = await db
      .collection('configuracoes')
      .doc('percentuais')
      .get();
    const { modoCotacao, cotacaoManual } = configDoc.data();
    const cotacaoBase =
      modoCotacao === 'manual' ? parseFloat(cotacaoManual) : 573.97;

    const totalComPercentual = lance + lance * (percentualExtra / 100);
    const pesoReal = pesoLote - descontoPesoPedra;
    const valorFinalPorGrama = pesoReal > 0 ? totalComPercentual / pesoReal : 0;

    const estimativaGanho =
      cotacaoBase && pesoReal > 0
        ? cotacaoBase * pesoReal - totalComPercentual
        : null;

    const loteAtualizado = {
      numeroLote,
      classificacao,
      lance,
      percentualExtra,
      totalComPercentual,
      descontoPesoPedra,
      pesoLote,
      pesoReal,
      valorFinalPorGrama,
      cotacaoBase,
      estimativaGanho,
      atualizadoEm: new Date().toISOString(),
    };

    await db.collection('lotes').doc(id).update(loteAtualizado);
    res.json({ sucesso: true, id, loteAtualizado });
  } catch (error) {
    console.error('Erro ao editar lote:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

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

router.post('/excluir-multiplos', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ erro: 'Nenhum ID fornecido' });
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
    res.status(500).json({ erro: 'Erro ao excluir lotes' });
  }
});

export default router;
