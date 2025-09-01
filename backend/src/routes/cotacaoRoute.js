// import express from 'express';
// import { db } from '../firebase/firebaseAdmin.js';

// const router = express.Router();

// // 🔹 GET /cotacao - retorna as configurações salvas
// router.get('/', async (req, res) => {
//   try {
//     console.log('📥 [GET] /cotacao chamado');
//     const doc = await db.collection('configuracoes').doc('percentuais').get();

//     if (!doc.exists) {
//       console.log(
//         '⚠️ Nenhuma configuração encontrada em configuracoes/percentuais'
//       );
//       return res.status(404).json({ erro: 'Configuração não encontrada' });
//     }

//     console.log('✅ Configuração encontrada:', doc.data());
//     res.json(doc.data());
//   } catch (error) {
//     console.error('❌ Erro no GET /cotacao:', error);
//     res.status(500).json({ erro: 'Erro ao buscar configurações' });
//   }
// });

// // 🔹 PUT /cotacao - atualiza as configurações (manual ou valores por tipo)
// router.put('/', async (req, res) => {
//   try {
//     console.log('📥 [PUT] /cotacao chamado');
//     console.log('📦 Body recebido:', req.body);

//     const {
//       cotacaoManual,
//       ouro750,
//       ouroBaixo,
//       pecaComDiamante,
//       modoCotacao = 'manual',
//     } = req.body;

//     const novaConfig = {
//       ...(cotacaoManual !== undefined && { cotacaoManual }),
//       ...(ouro750 !== undefined && { ouro750 }),
//       ...(ouroBaixo !== undefined && { ouroBaixo }),
//       ...(pecaComDiamante !== undefined && { pecaComDiamante }),
//       modoCotacao,
//       atualizadoEm: new Date().toISOString(),
//     };

//     console.log('📝 Objeto que será salvo:', novaConfig);

//     await db
//       .collection('configuracoes')
//       .doc('percentuais')
//       .set(novaConfig, { merge: true });

//     console.log('✅ Configuração salva com sucesso no Firestore');

//     res.json({ sucesso: true, configuracoesAtualizadas: novaConfig });
//   } catch (error) {
//     console.error('❌ Erro no PUT /cotacao:', error);
//     res.status(500).json({ erro: 'Erro ao salvar configurações' });
//   }
// });

// export default router;
