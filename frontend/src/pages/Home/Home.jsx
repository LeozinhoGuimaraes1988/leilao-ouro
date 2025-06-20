// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// import Sidebar from '../../components/Sidebar';
// // import NovoLoteModal from '../../components/NovoLoteModal';
// import EditarLoteModal from '../../components/EditarLoteModal';
// import LoteTable from '../../components/LoteTable';

// import styles from './Home.module.css';

// const Home = () => {
//   const [lotes, setLotes] = useState([]);
//   const [modalLote, setModalLote] = useState(null);
//   // const [mostrarModalLote, setMostrarModalLote] = useState(false);

//   // const adicionarLote = async (lote) => {
//   //   try {
//   //     // Obter cotação em cache ou tempo real
//   //     let cotacaoBase;
//   //     const cached = localStorage.getItem('cotacao_ouro');
//   //     const timestamp = localStorage.getItem('cotacao_ouro_timestamp');
//   //     const agora = Date.now();
//   //     const dezMinutos = 10 * 60 * 1000;

//   //     if (cached && timestamp && agora - Number(timestamp) < dezMinutos) {
//   //       cotacaoBase = Number(cached);
//   //     } else {
//   //       const { buscarCotacaoOuro } = await import(
//   //         '../../services/cotacaoService'
//   //       );
//   //       cotacaoBase = await buscarCotacaoOuro();
//   //       localStorage.setItem('cotacao_ouro', cotacaoBase.toString());
//   //       localStorage.setItem('cotacao_ouro_timestamp', agora.toString());
//   //     }

//   //     // Enviar novo lote com cotacaoBase
//   //     const response = await axios.post('http://localhost:3001/api/lotes', {
//   //       numeroLote: lote.codigo,
//   //       descricao: lote.descricao,
//   //       classificacao: lote.classificacao,
//   //       valor: parseFloat(lote.valor),
//   //       lance: parseFloat(lote.lance),
//   //       percentualExtra: 6,
//   //       descontoPesoPedra: parseFloat(lote.descontoPeso),
//   //       pesoLote: parseFloat(lote.pesoBruto),
//   //     });

//   //     const novoLote = response.data.lote;
//   //     setLotes((prev) => [...prev, novoLote]);
//   //   } catch (error) {
//   //     console.error('❌ Erro ao adicionar lote:', error);
//   //     alert('Erro ao salvar lote. Verifique o servidor.');
//   //   }
//   // };

//   useEffect(() => {
//     const carregarLotes = async () => {
//       try {
//         const res = await axios.get('http://localhost:3001/api/lotes');
//         setLotes(res.data.lotes);
//       } catch (err) {
//         console.error('Erro ao carregar lotes:', err);
//       }
//     };

//     carregarLotes();
//   }, []);

//   // const pesoLiquidoTotal = lotes.reduce(
//   //   (total, lote) => total + (lote.pesoReal || 0),
//   //   0
//   // );

//   const deletarLote = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3001/api/lotes/${id}`);
//       setLotes((prev) => prev.filter((l) => l.id !== id));
//     } catch (error) {
//       console.error('Erro ao excluir lote:', error);
//     }
//   };

//   const editarLote = (lote) => setModalLote(lote);

//   const salvarEdicao = async (dadosAtualizados) => {
//     try {
//       const res = await axios.put(
//         `http://localhost:3001/api/lotes/${modalLote.id}`,
//         dadosAtualizados
//       );
//       setLotes((prev) =>
//         prev.map((l) =>
//           l.id === modalLote.id ? { ...l, ...res.data.loteAtualizado } : l
//         )
//       );
//     } catch (err) {
//       console.error('Erro ao editar lote:', err);
//     }
//   };

//   useEffect(() => {
//     console.log('[📦 Lotes atuais]', lotes);
//   }, [lotes]);

//   return (
//     <>
//       <Sidebar />

//       {/* {mostrarModalLote && (
//         <NovoLoteModal
//           onClose={() => setMostrarModalLote(false)}
//           onAdd={adicionarLote}
//         />
//       )} */}

//       {modalLote && (
//         <EditarLoteModal
//           lote={modalLote}
//           onClose={() => setModalLote(null)}
//           onSave={salvarEdicao}
//         />
//       )}

//       <div className={styles.container}>
//         <h1 className={styles.title}>Gestão de Leilão de Ouro</h1>
//         <LoteTable
//           lotes={lotes}
//           setLotes={setLotes}
//           onDelete={deletarLote}
//           onEdit={editarLote}
//         />
//       </div>
//     </>
//   );
// };

// export default Home;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Sidebar from '../../components/Sidebar';
import EditarLoteModal from '../../components/EditarLoteModal';
import LoteTable from '../../components/LoteTable';

import styles from './Home.module.css';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE = isLocalhost
  ? 'http://localhost:3001/api' // Desenvolvimento local
  : '/api'; // Produção (Firebase Hosting + Functions)

const Home = () => {
  const [lotes, setLotes] = useState([]);
  const [modalLote, setModalLote] = useState(null);

  useEffect(() => {
    const carregarLotes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/lotes`);
        setLotes(res.data.lotes);
      } catch (err) {
        console.error('Erro ao carregar lotes:', err);
      }
    };

    carregarLotes();
  }, []);

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
