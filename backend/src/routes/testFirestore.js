import express from 'express';
import { db } from '../firebase/firebaseAdmin.js';
// import db from '../functions/firebase/firebaseAdmin.js'; // Importando o db do Firebase Admin

const router = express.Router();

// Rota GET de teste para ler dados do Firestore
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('testes').get();

    const dados = [];
    snapshot.forEach((doc) => {
      dados.push({ id: doc.id, ...doc.data() });
    });

    res.json({ sucesso: true, dados });
  } catch (error) {
    console.error('Erro ao acessar Firestore:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

// Rota POST para gravar um dado simples
router.post('/', async (req, res) => {
  try {
    const novo = {
      mensagem: 'Teste de gravação no Firestore',
      timestamp: new Date().toISOString(),
    };

    const docRef = await db.collection('testes').add(novo);
    res.status(201).json({ sucesso: true, id: docRef.id });
  } catch (error) {
    console.error('Erro ao gravar no Firestore:', error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

export default router;
