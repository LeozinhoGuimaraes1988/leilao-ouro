import React from 'react';
import styles from './UploadPdf.module.css';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE = isLocalhost
  ? 'http://localhost:3001/api' // Desenvolvimento local
  : 'https://leilao-ouro.onrender.com/api';

const UploadPdf = ({ onUploadSuccess }) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await fetch(`${API_BASE}/importar-pdf`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.sucesso) {
        alert(`${data.totalInseridos} lote(s) importado(s) com sucesso!`);

        const resposta = await fetch(`${API_BASE}/lotes`);
        const dataLotes = await resposta.json();

        if (Array.isArray(dataLotes.lotes)) {
          const primeiros20 = dataLotes.lotes.slice(0, 20);
          onUploadSuccess(primeiros20);
        } else {
          console.warn('❌ Resposta não contém um array de lotes:', dataLotes);
          alert('Erro ao carregar os lotes recém-importados.');
        }
      } else {
        alert('Erro ao importar PDF.');
      }
    } catch (err) {
      console.error('❌ Erro ao importar PDF:', err);
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div>
      <label htmlFor="uploadPdf" className={styles.uploadButton}>
        📄 Importar Catálogo
      </label>
      <input
        type="file"
        accept="application/pdf"
        id="uploadPdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default UploadPdf;
