import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

// 🔁 Função para buscar lotes paginados
export const getLotesPaginados = async (
  limitePorPagina = 5,
  ultimoDoc = null
) => {
  try {
    const lotesRef = collection(db, 'lotes');

    let queryLotes;

    if (ultimoDoc) {
      queryLotes = query(
        lotesRef,
        orderBy('criadoEm'),
        startAfter(ultimoDoc),
        limit(limitePorPagina)
      );
    } else {
      queryLotes = query(lotesRef, orderBy('criadoEm'), limit(limitePorPagina));
    }

    const snapshot = await getDocs(queryLotes);

    const lotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      lotes,
      ultimoDocumentoDaPagina: snapshot.docs[snapshot.docs.length - 1] || null,
      temMais: snapshot.size === limitePorPagina,
    };
  } catch (error) {
    console.error('Erro ao buscar lotes:', error);
    throw error;
  }
};
