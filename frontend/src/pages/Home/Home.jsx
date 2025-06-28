import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Sidebar from '../../components/Sidebar';
import EditarLoteModal from '../../components/EditarLoteModal';
import LoteTable from '../../components/LoteTable';

import styles from './Home.module.css';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE = isLocalhost
  ? 'http://localhost:3001/api' // Desenvolvimento local
  : 'https://leilao-ouro.onrender.com/api';

const Home = () => {
  const [lotes, setLotes] = useState([]);
  const [modalLote, setModalLote] = useState(null);

  const deletarLote = async (id) => {
    try {
      await axios.delete(`${API_BASE}/lotes/${id}`);
      setLotes((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Erro ao excluir lote:', error);
    }
  };

  const editarLote = (lote) => setModalLote(lote);

  const salvarEdicao = async (dadosAtualizados) => {
    try {
      const res = await axios.put(
        `${API_BASE}/lotes/${modalLote.id}`,
        dadosAtualizados
      );
      setLotes((prev) =>
        prev.map((l) =>
          l.id === modalLote.id ? { ...l, ...res.data.loteAtualizado } : l
        )
      );
    } catch (err) {
      console.error('Erro ao editar lote:', err);
    }
  };

  useEffect(() => {
    console.log('[📦 Lotes atuais]', lotes);
  }, [lotes]);

  return (
    <>
      <Sidebar />

      {modalLote && (
        <EditarLoteModal
          lote={modalLote}
          onClose={() => setModalLote(null)}
          onSave={salvarEdicao}
        />
      )}

      <div className={styles.container}>
        <h1 className={styles.title}>Gestão de Leilão de Ouro</h1>
        <LoteTable
          lotes={lotes}
          setLotes={setLotes}
          onDelete={deletarLote}
          onEdit={editarLote}
        />
      </div>
    </>
  );
};

export default Home;
