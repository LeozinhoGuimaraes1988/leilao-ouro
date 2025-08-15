import React, { useState, useEffect } from 'react';
import UploadPdf from './UploadPdf';
import LoteTableRow from './LoteTableRow';
import CarrinhoCompras from './CarrinhoCompras';
import styles from './LoteTable.module.css';
import { getLotesPaginados } from '../services/leilaoPaginado';
import { calcularTotaisDoLote } from '../utils/calculoLote';

const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : 'https://leilao-ouro.onrender.com/api';

/* ========================= Helpers ========================= */

/** Extrai só o primeiro código no formato ####.######-# */
const extrairPrimeiroCodigo = (s = '') => {
  const texto = String(s).replace(/\s+/g, ' ').trim();
  const m = texto.match(/(\d{4}\.\d{6,}-\d)/);
  return m ? m[1] : texto;
};

/** Extrai um possível segundo código (após / ou quebra de linha) ####.###.########-# */
const extrairSegundoCodigo = (s = '') => {
  const texto = String(s);
  const m = texto.match(/(?:\/|\s)(\d{4}\.\d{3}\.\d{8}-\d)/);
  return m ? m[1] : '';
};

/** Remove máscara e padroniza comprimento para comparação estável */
const normalizarChave = (codigo = '') =>
  String(codigo).replace(/\D/g, '').padStart(20, '0');

/** Comparador principal: primeiro pelo 1º código; se empatar, usa o 2º */
const compararLotes = (a, b, asc = true) => {
  const aFirst = normalizarChave(
    extrairPrimeiroCodigo(a.numeroLote || a.lote || a.id)
  );
  const bFirst = normalizarChave(
    extrairPrimeiroCodigo(b.numeroLote || b.lote || b.id)
  );

  if (aFirst !== bFirst) {
    return asc ? aFirst.localeCompare(bFirst) : bFirst.localeCompare(aFirst);
  }

  const aSecond = normalizarChave(extrairSegundoCodigo(a.numeroLote || ''));
  const bSecond = normalizarChave(extrairSegundoCodigo(b.numeroLote || ''));

  return asc ? aSecond.localeCompare(bSecond) : bSecond.localeCompare(aSecond);
};

/** Normaliza para busca: remove tudo que não é dígito */
const normalizarBusca = (s = '') => String(s).replace(/\D/g, '');

/** Filtra por número do lote (considera primeiro e segundo código) */
const filtrarPorBusca = (lista, termo) => {
  const n = normalizarBusca(termo);
  if (!n) return lista;
  return lista.filter((l) => {
    const a = normalizarBusca(l.numeroLote || l.lote || '');
    return a.includes(n);
  });
};
/* ========================================================== */

const LoteTable = ({ onEdit }) => {
  const [lotes, setLotes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [temMais, setTemMais] = useState(true);
  const [ordemAscendente, setOrdemAscendente] = useState(true);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [cotacoesSelecionadas, setCotacoesSelecionadas] = useState({});
  const [lotesVantajosos, setLotesVantajosos] = useState([]);

  // ------- BUSCA -------
  const [termoBusca, setTermoBusca] = useState('');
  const lotesExibidos = termoBusca ? filtrarPorBusca(lotes, termoBusca) : lotes;

  useEffect(() => {
    carregarPrimeiraPagina();
    fetchConfiguracoes();
  }, []);

  const carregarPrimeiraPagina = async () => {
    setCarregando(true);
    try {
      const {
        lotes: novosLotes,
        ultimoDocumentoDaPagina,
        temMais: temMaisPaginas,
      } = await getLotesPaginados(5);

      const ordenados = [...novosLotes].sort((a, b) =>
        compararLotes(a, b, true)
      );
      setLotes(ordenados);
      setUltimoDoc(ultimoDocumentoDaPagina);
      setTemMais(temMaisPaginas);
      setOrdemAscendente(true);
    } catch (err) {
      console.error('Erro ao carregar lotes:', err);
    } finally {
      setCarregando(false);
    }
  };

  const carregarMaisLotes = async () => {
    if (!temMais || carregando) return;
    setCarregando(true);
    try {
      const {
        lotes: novosLotes,
        ultimoDocumentoDaPagina,
        temMais: temMaisPaginas,
      } = await getLotesPaginados(5, ultimoDoc);

      setLotes((prev) =>
        [...prev, ...novosLotes].sort((a, b) =>
          compararLotes(a, b, ordemAscendente)
        )
      );
      setUltimoDoc(ultimoDocumentoDaPagina);
      setTemMais(temMaisPaginas);
    } catch (err) {
      console.error('Erro ao carregar mais lotes:', err);
    } finally {
      setCarregando(false);
    }
  };

  const fetchConfiguracoes = async () => {
    try {
      const res = await fetch(`${API_BASE}/configuracoes-cotacao`);
      const data = await res.json();
      setConfiguracoes({
        ouro750: Number(data.valoresFixos.ouro750),
        ouroBaixo: Number(data.valoresFixos.ouroBaixo),
        pecaComDiamante: Number(data.valoresFixos.pecaComDiamante),
        ouro1000: Number(data.cotacaoManual),
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const ordenarLotes = () => {
    const novaOrdemAsc = !ordemAscendente;
    setLotes((prev) =>
      [...prev].sort((a, b) => compararLotes(a, b, novaOrdemAsc))
    );
    setOrdemAscendente(novaOrdemAsc);
  };

  const excluirLote = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lote?')) return;
    try {
      const res = await fetch(`${API_BASE}/lotes/${id}`, { method: 'DELETE' });
      const resultado = await res.json();
      if (resultado.sucesso) {
        setLotes((prev) => prev.filter((lote) => lote.id !== id));
      } else {
        alert('Erro ao excluir o lote');
      }
    } catch (err) {
      console.error('Erro ao excluir lote:', err);
      alert('Erro ao excluir o lote');
    }
  };

  const deletarVariosLotes = async () => {
    if (!window.confirm('Deseja realmente excluir os lotes selecionados?'))
      return;
    try {
      const res = await fetch(`${API_BASE}/lotes/excluir-multiplos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selecionados }),
      });
      const resultado = await res.json();
      if (resultado.sucesso) {
        setLotes((prev) => prev.filter((l) => !selecionados.includes(l.id)));
        setSelecionados([]);
      }
    } catch (err) {
      console.error('Erro ao excluir lotes:', err);
      alert('Erro ao excluir lotes');
    }
  };

  const handleUploadSuccess = async () => {
    setLotes([]);
    setUltimoDoc(null);
    setTemMais(true);
    await carregarPrimeiraPagina();
  };

  // --------- CARRINHO DE COMPRAS ---------

  const handleToggleVantajoso = (lote, isVantajoso) => {
    if (isVantajoso) {
      const { total, ganhoEstimado } = calcularTotaisDoLote(lote);

      const loteComTotais = {
        ...lote,
        total,
        ganhoEstimado,
      };

      setLotesVantajosos((prev) => {
        if (!prev.some((l) => l.id === lote.id))
          return [...prev, loteComTotais];
        return prev;
      });
    } else {
      setLotesVantajosos((prev) => prev.filter((l) => l.id !== lote.id));
    }
  };

  const handleRemoverDoCarrinho = (loteId) => {
    setLotesVantajosos((prev) => prev.filter((l) => l.id !== loteId));
    setLotes((prev) =>
      prev.map((lote) =>
        lote.id === loteId ? { ...lote, vantajoso: false } : lote
      )
    );
  };

  const handleLimparCarrinho = () => {
    if (!window.confirm('Deseja realmente limpar todo o carrinho?')) return;
    setLotesVantajosos([]);
    setLotes((prev) => prev.map((lote) => ({ ...lote, vantajoso: false })));
  };

  const handleExportarCarrinho = () => {
    if (lotesVantajosos.length === 0)
      return alert('Nenhum lote selecionado para exportar');

    const dadosExport = lotesVantajosos.map((lote) => {
      const pesoReal =
        parseFloat(lote.pesoLote || 0) -
        parseFloat(lote.descontoPesoPedra || 0);
      const lance = parseFloat(lote.lance || 0);
      const total = lance + lance * 0.06;
      const ganho = pesoReal * lote.cotacaoBase - total;
      return {
        'Número do Lote': lote.numeroLote || lote.lote,
        Descrição: lote.descricao,
        Classificação: lote.classificacao,
        'Lance (R$)': lance.toFixed(2),
        'Total com 6% (R$)': total.toFixed(2),
        'Peso Real (g)': pesoReal.toFixed(2),
        'Ganho Estimado (R$)': ganho.toFixed(2),
      };
    });

    const csv = [
      Object.keys(dadosExport[0]).join(','),
      ...dadosExport.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `lotes_vantajosos_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------- FIM CARRINHO ---------

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <UploadPdf onUploadSuccess={handleUploadSuccess} />

        {/* Busca por número do lote */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por número do lote..."
            aria-label="Buscar por número do lote"
            style={{
              padding: '8px 10px',
              minWidth: 280,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />
          {termoBusca && (
            <button onClick={() => setTermoBusca('')}>Limpar</button>
          )}
        </div>
      </div>

      {lotesExibidos.length === 0 && !carregando && (
        <p>
          {termoBusca
            ? `Nenhum lote encontrado para "${termoBusca}".`
            : 'Nenhum lote adicionado.'}
        </p>
      )}

      {lotesExibidos.length > 0 && (
        <div className={styles.scrollWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={ordenarLotes} style={{ cursor: 'pointer' }}>
                  Lote {ordemAscendente ? '▲' : '▼'}
                </th>
                <th>Descrição</th>
                <th>Classificação</th>
                <th>Valor (R$)</th>
                <th>Lance</th>
                <th>6%</th>
                <th>Total (R$)</th>
                <th>Desconto Pedra</th>
                <th>Peso Lote</th>
                <th>Peso Real</th>
                <th>Valor por g</th>
                <th>Estimativa de Ganho</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lotesExibidos.map((lote, index) => (
                <LoteTableRow
                  key={`${lote.id}-${index}`}
                  lote={lote}
                  index={index}
                  configuracoes={configuracoes}
                  cotacoesSelecionadas={cotacoesSelecionadas}
                  setCotacoesSelecionadas={setCotacoesSelecionadas}
                  setLotes={setLotes}
                  selecionados={selecionados}
                  setSelecionados={setSelecionados}
                  onDelete={excluirLote}
                  onEdit={onEdit}
                  onToggleVantajoso={handleToggleVantajoso}
                  lotesVantajosos={lotesVantajosos}
                  ganhoEstimado={lote.ganhoEstimado}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {carregando && <p>Carregando...</p>}

      {/* Esconde "Carregar mais" quando estiver em modo de busca */}
      {temMais && !carregando && !termoBusca && (
        <div className={styles.botaoWrapper}>
          <button onClick={carregarMaisLotes} className={styles.carregarMais}>
            Carregar mais
          </button>
        </div>
      )}

      {selecionados.length >= 2 && (
        <div className={styles.excluirToolbar}>
          <button onClick={deletarVariosLotes} className={styles.confirmDelete}>
            🗑️ Excluir Selecionados ({selecionados.length})
          </button>
        </div>
      )}

      <CarrinhoCompras
        lotesVantajosos={lotesVantajosos}
        onRemoverLote={handleRemoverDoCarrinho}
        onLimparCarrinho={handleLimparCarrinho}
        onExportarCarrinho={handleExportarCarrinho}
      />
    </div>
  );
};

export default LoteTable;
