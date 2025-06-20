import React, { useRef, useEffect, useState } from 'react';
import UploadPdf from './UploadPdf';
import styles from './LoteTable.module.css';
import { getLotesPaginados } from '../services/leilaoPaginado';
import LoteTableRow from './LoteTableRow';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE = isLocalhost
  ? 'http://localhost:3001/api' // Desenvolvimento local
  : '/api'; // Produção (Firebase Hosting + Functions)

const LoteTable = ({ lotes, setLotes, onDelete, onEdit }) => {
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [cotacoesSelecionadas, setCotacoesSelecionadas] = useState({});
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [temMais, setTemMais] = useState(true);

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      try {
        const res = await fetch(`${API_BASE}/configuracoes-cotacao`);
        const data = await res.json();
        setConfiguracoes({
          ouro750: Number(data.valoresFixos.ouro750),
          ouroBaixo: Number(data.valoresFixos.ouroBaixo),
          pecaComDiamante: Number(data.valoresFixos.pecaComDiamante),
          ouro1000: Number(data.cotacaoManual), // opcional, se usar manual
        });
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
      }
    };

    fetchConfiguracoes();
  }, []);

  const deletarVariosLotes = async () => {
    if (window.confirm('Deseja realmente excluir os lotes selecionados?')) {
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
        alert('Erro ao excluir lotes');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    const top = topScrollRef.current;
    const bottom = bottomScrollRef.current;

    if (top && bottom) {
      const handleTopScroll = (e) => {
        bottom.scrollLeft = e.target.scrollLeft;
      };
      const handleBottomScroll = (e) => {
        top.scrollLeft = e.target.scrollLeft;
      };

      top.addEventListener('scroll', handleTopScroll);
      bottom.addEventListener('scroll', handleBottomScroll);

      return () => {
        top.removeEventListener('scroll', handleTopScroll);
        bottom.removeEventListener('scroll', handleBottomScroll);
      };
    }
  }, []);

  const carregarMaisLotes = async () => {
    const {
      lotes: novosLotes,
      ultimoDocumentoDaPagina,
      temMais: maisPaginas,
    } = await getLotesPaginados(10, ultimoDoc);

    setLotes((prev) => {
      const existentes = new Set(prev.map((l) => l.id));
      const novosUnicos = novosLotes.filter((l) => !existentes.has(l.id));
      return [...prev, ...novosUnicos];
    });

    setUltimoDoc(ultimoDocumentoDaPagina);
    setTemMais(maisPaginas);
  };

  const handleUploadSuccess = async () => {
    setLotes([]);
    setUltimoDoc(null);
    setTemMais(true);
    await carregarMaisLotes();
  };

  if (!lotes || lotes.length === 0) {
    return (
      <div>
        <div className={styles.header}>
          <UploadPdf onUploadSuccess={handleUploadSuccess} />
        </div>
        <p>Nenhum lote adicionado.</p>
      </div>
    );
  }

  const totais = lotes.reduce(
    (acc, lote) => {
      const pesoLote = parseFloat(lote.pesoLote);
      const desconto = parseFloat(lote.descontoPesoPedra);
      const pesoReal = pesoLote - desconto;
      const cotacao = lote.cotacaoBase;

      const podeCalcular =
        lote.classificacao &&
        lote.classificacao !== '' &&
        !isNaN(pesoLote) &&
        !isNaN(desconto) &&
        pesoReal > 0 &&
        typeof cotacao === 'number' &&
        cotacao > 0;

      if (!podeCalcular) return acc;

      const lance =
        typeof lote.lance === 'number' && lote.lance > 0
          ? lote.lance
          : cotacao * pesoReal;

      const seisPorcento = lance * 0.06;
      const total = lance + seisPorcento;
      const ganhoEstimado = pesoReal * cotacao - total;

      acc.lance += lance;
      acc.seisPorcento += seisPorcento;
      acc.total += total;
      acc.ganhoEstimado += ganhoEstimado;

      return acc;
    },
    {
      lance: 0,
      seisPorcento: 0,
      total: 0,
      ganhoEstimado: 0,
    }
  );

  return (
    <div>
      <div>
        <div className={styles.header}>
          <UploadPdf onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className={styles.scrollWrapper}>
          <table>
            <thead>
              <tr>
                <th>Lote</th>
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
              {lotes.map((lote, index) => (
                <LoteTableRow
                  key={`${lote.id}-${lote.numeroLote}-${index}`}
                  lote={lote}
                  index={index}
                  configuracoes={configuracoes}
                  cotacoesSelecionadas={cotacoesSelecionadas}
                  setCotacoesSelecionadas={setCotacoesSelecionadas}
                  setLotes={setLotes}
                  selecionados={selecionados}
                  setSelecionados={setSelecionados}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  Totais:
                </td>
                <td>R$ {totais.lance.toFixed(2)}</td>
                <td>R$ {totais.seisPorcento.toFixed(2)}</td>
                <td>R$ {totais.total.toFixed(2)}</td>
                <td colSpan={4}></td>
                <td
                  style={{
                    fontWeight: 'bold',
                    color:
                      totais.ganhoEstimado > 0
                        ? 'green'
                        : totais.ganhoEstimado < 0
                        ? 'red'
                        : '#333',
                  }}
                >
                  R$ {totais.ganhoEstimado.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {temMais && (
          <div className={styles.botaoWrapper}>
            <button onClick={carregarMaisLotes} className={styles.carregarMais}>
              Carregar mais
            </button>
          </div>
        )}

        {selecionados.length >= 2 && (
          <div className={styles.excluirToolbar}>
            <button
              onClick={deletarVariosLotes}
              className={styles.confirmDelete}
            >
              🗑️ Excluir Selecionados ({selecionados.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoteTable;
