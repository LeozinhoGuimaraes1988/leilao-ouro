// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import styles from './ConfiguracoesCotacao.module.css';
// import Sidebar from './Sidebar';
// import { Link } from 'react-router-dom';

// const isLocalhost = window.location.hostname === 'localhost';

// const API_BASE = isLocalhost
//   ? 'http://localhost:3001/api' // Desenvolvimento local
//   : 'https://leilao-ouro.onrender.com/api'; // PRODUÇÃO aponta para Render

// const ConfiguracoesCotacao = () => {
//   const [percentuais, setPercentuais] = useState({
//     ouro750: '',
//     ouroBaixo: '',
//     pecaComDiamante: '',
//   });

//   const [carregando, setCarregando] = useState(true);
//   const [salvando, setSalvando] = useState(false);
//   const [mensagem, setMensagem] = useState('');
//   const [modoCotacao, setModoCotacao] = useState('manual');
//   const [cotacaoManual, setCotacaoManual] = useState('');

//   useEffect(() => {
//     const buscarPercentuais = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/configuracoes-cotacao`);

//         setPercentuais(res.data.valoresFixos);
//         setModoCotacao(res.data.modoCotacao || 'manual');
//         setCotacaoManual(res.data.cotacaoManual || '');
//       } catch (err) {
//         console.error('Erro ao buscar configurações:', err);
//       } finally {
//         setCarregando(false);
//       }
//     };

//     buscarPercentuais();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setPercentuais((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSalvar = async () => {
//     setSalvando(true);

//     try {
//       await axios.put(`${API_BASE}/configuracoes-cotacao`, {
//         modoCotacao,
//         cotacaoManual: Number(cotacaoManual),
//         valoresFixos: {
//           ouro750: Number(percentuais.ouro750),
//           ouroBaixo: Number(percentuais.ouroBaixo),
//           pecaComDiamante: Number(percentuais.pecaComDiamante),
//         },
//       });

//       setMensagem('✅ Configurações salvas com sucesso!');
//     } catch (err) {
//       console.error('Erro ao salvar:', err);
//       setMensagem('❌ Erro ao salvar configurações');
//     } finally {
//       setSalvando(false);
//       setTimeout(() => setMensagem(''), 3000);
//     }
//   };

//   if (carregando) return <p>Carregando...</p>;

//   return (
//     <div>
//       <Sidebar />
//       <div className={styles.container}>
//         <h2>Configurações de Cotação</h2>

//         <div className={styles.inputGroup}>
//           <p>
//             Tipo de cotação atual: <strong>Manual</strong>
//           </p>
//           <div className={styles.inputGroup}>
//             <label>Valor da cotação manual (ouro 1000 - R$)</label>
//             <input
//               type="number"
//               value={cotacaoManual}
//               onChange={(e) => setCotacaoManual(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className={styles.inputGroup}>
//           <label>Valor Ouro 750 (R$)</label>
//           <input
//             type="number"
//             name="ouro750"
//             value={percentuais.ouro750}
//             onChange={handleChange}
//           />
//         </div>

//         <div className={styles.inputGroup}>
//           <label>Ouro Baixo (R$)</label>
//           <input
//             type="number"
//             name="ouroBaixo"
//             value={percentuais.ouroBaixo}
//             onChange={handleChange}
//           />
//         </div>

//         <div className={styles.inputGroup}>
//           <label>Peça com Diamante (R$)</label>
//           <input
//             type="number"
//             name="pecaComDiamante"
//             value={percentuais.pecaComDiamante}
//             onChange={handleChange}
//           />
//         </div>

//         <button
//           onClick={handleSalvar}
//           disabled={salvando}
//           className={styles.salvarBtn}
//         >
//           {salvando ? 'Salvando...' : 'Salvar Configurações'}
//         </button>

//         <Link to="/home">
//           <button className={styles.voltarBtn}>Voltar</button>
//         </Link>

//         {mensagem && <p>{mensagem}</p>}
//       </div>
//     </div>
//   );
// };

// export default ConfiguracoesCotacao;

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from './ConfiguracoesCotacao.module.css';
import Sidebar from './Sidebar.jsx';
import { Link } from 'react-router-dom';

/* ================== Detecta API ================== */
const detectApiBase = async () => {
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(
    window.location.hostname
  );

  const candidates = isLocal
    ? ['http://localhost:3001/api', 'https://leilao-ouro.onrender.com/api']
    : ['/api', 'https://leilao-ouro.onrender.com/api'];

  const tryBase = async (base, ms = 2000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(`${base}/health`, {
        method: 'GET',
        signal: ctrl.signal,
        cache: 'no-store',
        credentials: 'omit',
      });
      clearTimeout(t);
      return res.ok;
    } catch {
      clearTimeout(t);
      return false;
    }
  };

  for (const base of candidates) {
    if (await tryBase(base)) return base;
  }
  return 'https://leilao-ouro.onrender.com/api';
};
/* ================================================ */

const ConfiguracoesCotacao = () => {
  const [API_BASE, setApiBase] = useState(null);

  const [valoresFixos, setValoresFixos] = useState({
    ouro750: '',
    ouroBaixo: '',
    pecaComDiamante: '',
  });

  const [percentuais, setPercentuais] = useState({
    ouro750: '',
    ouroBaixo: '',
    pecaComDiamante: '',
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [modoCotacao, setModoCotacao] = useState('manual');
  const [tipoDefinicao, setTipoDefinicao] = useState('valores');
  const [cotacaoManual, setCotacaoManual] = useState('');

  // Buscar a API logo no início
  useEffect(() => {
    (async () => {
      const base = await detectApiBase();
      setApiBase(base);
    })();
  }, []);

  // Atualiza valores automaticamente a partir dos percentuais
  const calcularValoresAutomaticos = useCallback(() => {
    if (!cotacaoManual || tipoDefinicao !== 'percentuais') return;

    const base = Number(cotacaoManual);
    const novosValores = {
      ouro750: percentuais.ouro750
        ? ((base * Number(percentuais.ouro750)) / 100).toFixed(2)
        : '',
      ouroBaixo: percentuais.ouroBaixo
        ? ((base * Number(percentuais.ouroBaixo)) / 100).toFixed(2)
        : '',
      pecaComDiamante: percentuais.pecaComDiamante
        ? ((base * Number(percentuais.pecaComDiamante)) / 100).toFixed(2)
        : '',
    };

    setValoresFixos(novosValores);
  }, [cotacaoManual, percentuais, tipoDefinicao]);

  useEffect(() => {
    calcularValoresAutomaticos();
  }, [calcularValoresAutomaticos]);

  // Buscar configurações
  useEffect(() => {
    if (!API_BASE) return;
    const buscarConfiguracoes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/configuracoes-cotacao`);

        setValoresFixos(
          res.data.valoresFixos || {
            ouro750: '',
            ouroBaixo: '',
            pecaComDiamante: '',
          }
        );

        setPercentuais(
          res.data.percentuais || {
            ouro750: '',
            ouroBaixo: '',
            pecaComDiamante: '',
          }
        );

        setModoCotacao(res.data.modoCotacao || 'manual');
        setTipoDefinicao(res.data.tipoDefinicao || 'valores');
        setCotacaoManual(res.data.cotacaoManual || '');
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      } finally {
        setCarregando(false);
      }
    };

    buscarConfiguracoes();
  }, [API_BASE]);

  const handleChangeValores = (e) => {
    const { name, value } = e.target;
    setValoresFixos((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePercentuais = (e) => {
    const { name, value } = e.target;
    setPercentuais((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!API_BASE) return;
    setSalvando(true);

    try {
      await axios.put(`${API_BASE}/configuracoes-cotacao`, {
        modoCotacao,
        tipoDefinicao,
        cotacaoManual: Number(cotacaoManual),
        valoresFixos: {
          ouro750: Number(valoresFixos.ouro750),
          ouroBaixo: Number(valoresFixos.ouroBaixo),
          pecaComDiamante: Number(valoresFixos.pecaComDiamante),
        },
        percentuais: {
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

  if (!API_BASE) return <p>🔄 Detectando servidor...</p>;
  if (carregando) return <p>Carregando...</p>;

  return (
    <div>
      <Sidebar />
      <div className={styles.container}>
        <h2>Configurações de Cotação</h2>

        {/* Cotação Base do Ouro 1000 */}
        <div className={styles.secao}>
          <h3>Cotação Base</h3>
          <div>
            <label>Valor da cotação manual (ouro 1000 - R$)</label>
            <input
              type="number"
              step="0.01"
              value={cotacaoManual}
              onChange={(e) => setCotacaoManual(e.target.value)}
              placeholder="Ex: 200.00"
              className={styles.cotacaoInput}
            />
          </div>
        </div>

        {/* Tipo de Definição */}
        <div className={styles.secao}>
          <h3>Método de Definição das Outras Cotações</h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="percentuais"
                checked={tipoDefinicao === 'percentuais'}
                onChange={(e) => setTipoDefinicao(e.target.value)}
              />
              <span>Definir por porcentagem da cotação base</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="valores"
                checked={tipoDefinicao === 'valores'}
                onChange={(e) => setTipoDefinicao(e.target.value)}
              />
              <span>Definir valores manuais</span>
            </label>
          </div>
        </div>

        {/* Configuração por Percentuais */}
        {tipoDefinicao === 'percentuais' && (
          <div className={styles.secao}>
            <h3>Percentuais em relação ao Ouro 1000</h3>
            <div className={styles.percentuaisGrid}>
              <div className={styles.inputGroup}>
                <label>Ouro 750 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="ouro750"
                  value={percentuais.ouro750}
                  onChange={handleChangePercentuais}
                  placeholder="Ex: 75"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Ouro Baixo (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="ouroBaixo"
                  value={percentuais.ouroBaixo}
                  onChange={handleChangePercentuais}
                  placeholder="Ex: 58"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Peça com Diamante (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="pecaComDiamante"
                  value={percentuais.pecaComDiamante}
                  onChange={handleChangePercentuais}
                  placeholder="Ex: 40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Configuração por Valores */}
        {tipoDefinicao === 'valores' && (
          <div className={styles.secao}>
            <h3>Valores Manuais</h3>
            <div className={styles.valoresGrid}>
              <div className={styles.inputGroup}>
                <label>Valor Ouro 750 (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ouro750"
                  value={valoresFixos.ouro750}
                  onChange={handleChangeValores}
                  placeholder="Ex: 150.00"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Ouro Baixo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ouroBaixo"
                  value={valoresFixos.ouroBaixo}
                  onChange={handleChangeValores}
                  placeholder="Ex: 116.00"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Peça com Diamante (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="pecaComDiamante"
                  value={valoresFixos.pecaComDiamante}
                  onChange={handleChangeValores}
                  placeholder="Ex: 80.00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className={styles.resumo}>
          <h3>Resumo das Cotações Atuais</h3>
          <div className={styles.resumoGrid}>
            <div className={styles.resumoItem}>
              <span>Ouro 1000:</span>
              <strong>R$ {Number(cotacaoManual || 0).toFixed(2)}</strong>
            </div>
            <div className={styles.resumoItem}>
              <span>Ouro 750:</span>
              <strong>R$ {Number(valoresFixos.ouro750 || 0).toFixed(2)}</strong>
            </div>
            <div className={styles.resumoItem}>
              <span>Ouro Baixo:</span>
              <strong>
                R$ {Number(valoresFixos.ouroBaixo || 0).toFixed(2)}
              </strong>
            </div>
            <div className={styles.resumoItem}>
              <span>Peça com Diamante:</span>
              <strong>
                R$ {Number(valoresFixos.pecaComDiamante || 0).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className={styles.acoes}>
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
        </div>

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
      </div>
    </div>
  );
};

export default ConfiguracoesCotacao;
