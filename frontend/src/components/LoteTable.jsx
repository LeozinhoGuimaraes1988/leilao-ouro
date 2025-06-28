import React, { useEffect, useState } from 'react';

import UploadPdf from './UploadPdf';
import styles from './LoteTable.module.css';
import { getLotesPaginados } from '../services/leilaoPaginado';
import LoteTableRow from './LoteTableRow';

// Componente principal da tabela de lotes
const LoteTable = ({ onEdit }) => {
  const [lotes, setLotes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [temMais, setTemMais] = useState(true);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  // Configurações de cotação
  const [configuracoes, setConfiguracoes] = useState(null);
  const [selecionados, setSelecionados] = useState([]);
  const [cotacoesSelecionadas, setCotacoesSelecionadas] = useState({});

  const ordenarLotes = () => {
    const lotesOrdenados = [...lotes].sort((a, b) => {
      const numeroA = a.numeroLote || a.lote || a.id; // ajusta conforme o campo real
      const numeroB = b.numeroLote || b.lote || b.id;

      return ordemAscendente
        ? String(numeroA).localeCompare(String(numeroB), 'pt-BR', {
            numeric: true,
          })
        : String(numeroB).localeCompare(String(numeroA), 'pt-BR', {
            numeric: true,
          });
    });

    setLotes(lotesOrdenados);
    setOrdemAscendente(!ordemAscendente);
  };

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
        temMais,
      } = await getLotesPaginados(5);

      setLotes(novosLotes);
      setUltimoDoc(ultimoDocumentoDaPagina);
      setTemMais(temMais);
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
        temMais,
      } = await getLotesPaginados(5, ultimoDoc);

      setLotes((prev) => [...prev, ...novosLotes]);
      setUltimoDoc(ultimoDocumentoDaPagina);
      setTemMais(temMais);
    } catch (err) {
      console.error('Erro ao carregar mais lotes:', err);
    } finally {
      setCarregando(false);
    }
  };

  const fetchConfiguracoes = async () => {
    try {
      const res = await fetch(
        window.location.hostname === 'localhost'
          ? 'http://localhost:3001/api/configuracoes-cotacao'
          : 'https://leilao-ouro.onrender.com/api/configuracoes-cotacao'
      );
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

  const excluirLote = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lote?')) return;

    try {
      const res = await fetch(
        `${
          window.location.hostname === 'localhost'
            ? 'http://localhost:3001/api'
            : 'https://leilao-ouro.onrender.com/api'
        }/lotes/${id}`,
        {
          method: 'DELETE',
        }
      );

      const resultado = await res.json();

      if (resultado.sucesso) {
        setLotes((prev) => prev.filter((lote) => lote.id !== id)); // ✅ Remove visualmente
      } else {
        alert('Erro ao excluir o lote');
      }
    } catch (err) {
      console.error('Erro ao excluir lote:', err);
      alert('Erro ao excluir o lote');
    }
  };

  const deletarVariosLotes = async () => {
    if (window.confirm('Deseja realmente excluir os lotes selecionados?')) {
      try {
        const res = await fetch(
          `${
            window.location.hostname === 'localhost'
              ? 'http://localhost:3001/api'
              : 'https://leilao-ouro.onrender.com/api'
          }/lotes/excluir-multiplos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: selecionados }),
          }
        );

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

  const handleUploadSuccess = async () => {
    setLotes([]);
    setUltimoDoc(null);
    setTemMais(true);
    await carregarPrimeiraPagina();
  };

  const totais = lotes.reduce(
    (acc, lote) => {
      const pesoLote = parseFloat(lote.pesoLote);
      const desconto = parseFloat(lote.descontoPesoPedra);
      const pesoReal = pesoLote - desconto;
      const cotacao = lote.cotacaoBase;

      const podeCalcular =
        lote.classificacao &&
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
      <div className={styles.header}>
        <UploadPdf onUploadSuccess={handleUploadSuccess} />
      </div>

      {lotes.length === 0 && <p>Nenhum lote adicionado.</p>}

      {lotes.length > 0 && (
        <div className={styles.scrollWrapper}>
          <table>
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
              {lotes.map((lote, index) => (
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
      )}

      {carregando && <p>Carregando...</p>}

      {temMais && !carregando && (
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
    </div>
  );
};

export default LoteTable;
