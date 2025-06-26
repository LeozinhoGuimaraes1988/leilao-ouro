import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ConfiguracoesCotacao.module.css';
import Sidebar from './Sidebar';
import { Link } from 'react-router-dom';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE = isLocalhost
  ? 'http://localhost:3001/api' // Desenvolvimento local
  : 'https://leilao-ouro.onrender.com/api'; // PRODUÇÃO aponta para Render

const ConfiguracoesCotacao = () => {
  const [percentuais, setPercentuais] = useState({
    ouro750: '',
    ouroBaixo: '',
    pecaComDiamante: '',
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [modoCotacao, setModoCotacao] = useState('manual');
  const [cotacaoManual, setCotacaoManual] = useState('');

  useEffect(() => {
    const buscarPercentuais = async () => {
      try {
        const res = await axios.get(`${API_BASE}/configuracoes-cotacao`);

        setPercentuais(res.data.valoresFixos);
        setModoCotacao(res.data.modoCotacao || 'manual');
        setCotacaoManual(res.data.cotacaoManual || '');
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      } finally {
        setCarregando(false);
      }
    };

    buscarPercentuais();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPercentuais((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    setSalvando(true);

    try {
      await axios.put(`${API_BASE}/configuracoes-cotacao`, {
        modoCotacao,
        cotacaoManual: Number(cotacaoManual),
        valoresFixos: {
          ouro750: Number(percentuais.ouro750),
          ouroBaixo: Number(percentuais.ouroBaixo),
          pecaComDiamante: Number(percentuais.pecaComDiamante),
        },
      });

      setMensagem('✅ Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setMensagem('❌ Erro ao salvar configurações');
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <Sidebar />
      <div className={styles.container}>
        <h2>Configurações de Cotação</h2>

        <div className={styles.inputGroup}>
          <p>
            Tipo de cotação atual: <strong>Manual</strong>
          </p>
          <div className={styles.inputGroup}>
            <label>Valor da cotação manual (ouro 1000 - R$)</label>
            <input
              type="number"
              value={cotacaoManual}
              onChange={(e) => setCotacaoManual(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Valor Ouro 750 (R$)</label>
          <input
            type="number"
            name="ouro750"
            value={percentuais.ouro750}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Ouro Baixo (R$)</label>
          <input
            type="number"
            name="ouroBaixo"
            value={percentuais.ouroBaixo}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Peça com Diamante (R$)</label>
          <input
            type="number"
            name="pecaComDiamante"
            value={percentuais.pecaComDiamante}
            onChange={handleChange}
          />
        </div>

        <button
          onClick={handleSalvar}
          disabled={salvando}
          className={styles.salvarBtn}
        >
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </button>

        <Link to="/home">
          <button className={styles.voltarBtn}>Voltar</button>
        </Link>

        {mensagem && <p>{mensagem}</p>}
      </div>
    </div>
  );
};

export default ConfiguracoesCotacao;
