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

  // 🔹 valores separados
  const [valoresManuais, setValoresManuais] = useState({
    ouro750: '',
    ouroBaixo: '',
    pecaComDiamante: '',
  });

  const [valoresPercentuais, setValoresPercentuais] = useState({
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
  const [tipoDefinicao, setTipoDefinicao] = useState(null);
  const [cotacaoManual, setCotacaoManual] = useState('');

  // Detecta API
  useEffect(() => {
    (async () => {
      const base = await detectApiBase();
      setApiBase(base);
    })();
  }, []);

  // Buscar configurações
  useEffect(() => {
    if (!API_BASE) return;

    const buscarConfiguracoes = async () => {
      try {
        const res = await axios.get(`${API_BASE}/configuracoes-cotacao`);

        setValoresManuais({
          ouro750: res.data?.valoresManuais?.ouro750 ?? '',
          ouroBaixo: res.data?.valoresManuais?.ouroBaixo ?? '',
          pecaComDiamante: res.data?.valoresManuais?.pecaComDiamante ?? '',
        });

        setValoresPercentuais({
          ouro750: res.data?.valoresPercentuais?.ouro750 ?? '',
          ouroBaixo: res.data?.valoresPercentuais?.ouroBaixo ?? '',
          pecaComDiamante: res.data?.valoresPercentuais?.pecaComDiamante ?? '',
        });

        setPercentuais(res.data?.percentuais ?? {});

        setModoCotacao(res.data?.modoCotacao || 'manual');
        const lastTipo =
          res.data?.tipoDefinicao ||
          localStorage.getItem('tipoDefinicao') ||
          'valores';
        setTipoDefinicao(lastTipo);

        setCotacaoManual(res.data?.cotacaoManual ?? '');
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      } finally {
        setCarregando(false);
      }
    };

    buscarConfiguracoes();
  }, [API_BASE]);

  const handleChangeValoresManuais = (e) => {
    const { name, value } = e.target;
    setValoresManuais((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePercentuais = (e) => {
    const { name, value } = e.target;
    setPercentuais((prev) => ({ ...prev, [name]: value }));
  };

  // troca segura do tipo (não zera nada)
  const handleTipoDefinicaoChange = (value) => {
    setTipoDefinicao(value);
    localStorage.setItem('tipoDefinicao', value);
  };

  // Calcula valores percentuais
  const calcularValoresAutomaticos = useCallback(() => {
    if (carregando || tipoDefinicao !== 'percentuais') return;
    const base = parseFloat(cotacaoManual);
    if (!Number.isFinite(base)) return;

    setValoresPercentuais({
      ouro750:
        percentuais.ouro750 !== ''
          ? ((base * Number(percentuais.ouro750)) / 100).toFixed(2)
          : valoresPercentuais.ouro750,
      ouroBaixo:
        percentuais.ouroBaixo !== ''
          ? ((base * Number(percentuais.ouroBaixo)) / 100).toFixed(2)
          : valoresPercentuais.ouroBaixo,
      pecaComDiamante:
        percentuais.pecaComDiamante !== ''
          ? ((base * Number(percentuais.pecaComDiamante)) / 100).toFixed(2)
          : valoresPercentuais.pecaComDiamante,
    });
  }, [carregando, cotacaoManual, percentuais, tipoDefinicao]);

  useEffect(() => {
    calcularValoresAutomaticos();
  }, [calcularValoresAutomaticos]);

  const handleSalvar = async () => {
    if (!API_BASE) return;
    setSalvando(true);

    try {
      await axios.put(`${API_BASE}/configuracoes-cotacao`, {
        modoCotacao,
        tipoDefinicao,
        cotacaoManual: Number(cotacaoManual),
        valoresManuais: {
          ouro750: Number(valoresManuais.ouro750),
          ouroBaixo: Number(valoresManuais.ouroBaixo),
          pecaComDiamante: Number(valoresManuais.pecaComDiamante),
        },
        valoresPercentuais: {
          ouro750: Number(valoresPercentuais.ouro750),
          ouroBaixo: Number(valoresPercentuais.ouroBaixo),
          pecaComDiamante: Number(valoresPercentuais.pecaComDiamante),
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
  if (carregando || tipoDefinicao === null) return <p>Carregando...</p>;

  // 🔹 Decide quais valores mostrar no resumo
  const valoresAtuais =
    tipoDefinicao === 'percentuais' ? valoresPercentuais : valoresManuais;

  return (
    <div>
      <Sidebar />
      <div className={styles.container}>
        <h2>Configurações de Cotação</h2>

        {/* Cotação Base */}
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

        {/* Método */}
        <div className={styles.secao}>
          <h3>Método de Definição das Outras Cotações</h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="percentuais"
                checked={tipoDefinicao === 'percentuais'}
                onChange={(e) => handleTipoDefinicaoChange(e.target.value)}
              />
              <span>Definir por porcentagem da cotação base</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="valores"
                checked={tipoDefinicao === 'valores'}
                onChange={(e) => handleTipoDefinicaoChange(e.target.value)}
              />
              <span>Definir valores manuais</span>
            </label>
          </div>
        </div>

        {/* Percentuais */}
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Manuais */}
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
                  value={valoresManuais.ouro750}
                  onChange={handleChangeValoresManuais}
                  placeholder="Ex: 150.00"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Ouro Baixo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ouroBaixo"
                  value={valoresManuais.ouroBaixo}
                  onChange={handleChangeValoresManuais}
                  placeholder="Ex: 100.00"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Peça com Diamante (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="pecaComDiamante"
                  value={valoresManuais.pecaComDiamante}
                  onChange={handleChangeValoresManuais}
                  placeholder="Ex: 50.00"
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
              <strong>
                R$ {Number(valoresAtuais.ouro750 || 0).toFixed(2)}
              </strong>
            </div>
            <div className={styles.resumoItem}>
              <span>Ouro Baixo:</span>
              <strong>
                R$ {Number(valoresAtuais.ouroBaixo || 0).toFixed(2)}
              </strong>
            </div>
            <div className={styles.resumoItem}>
              <span>Peça com Diamante:</span>
              <strong>
                R$ {Number(valoresAtuais.pecaComDiamante || 0).toFixed(2)}
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
