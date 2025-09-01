import { useCalculoLote } from '../hooks/useCalculoLote';
import styles from './LoteTable.module.css';

const LoteTableRow = ({
  lote,
  index,
  configuracoes,
  cotacoesSelecionadas,
  setCotacoesSelecionadas,
  setLotes,
  selecionados,
  setSelecionados,
  onDelete,
  onEdit,
  onToggleVantajoso,
  lotesVantajosos,
}) => {
  const cotacoes = {
    ouro1000: Number(configuracoes?.ouro1000 || 0),
    ouro750: Number(configuracoes?.ouro750 || 0),
    ouroBaixo: Number(configuracoes?.ouroBaixo || 0),
    pecaComDiamante: Number(configuracoes?.pecaComDiamante || 0),
  };

  // 🔹 Hook recebe também configuracoes e decide baseado na classificação
  const {
    valor,
    pesoLote,
    pesoReal,
    lance,
    seisPorcento,
    total,
    valorPorGrama,
    ganhoEstimado,
  } = useCalculoLote(lote, cotacoes);

  const key = `${lote.id}-${lote.numeroLote}-${index}`;
  const isVantajoso = lotesVantajosos.some((l) => l.id === lote.id);

  return (
    <tr key={key}>
      <td>{lote.numeroLote}</td>
      <td>{lote.descricao || '—'}</td>

      {/* Classificação */}
      <td>
        <select
          className={styles.select}
          name="classificacao"
          value={cotacoesSelecionadas[lote.id] || ''}
          onChange={(e) => {
            const tipo = e.target.value;
            const valorCotacao =
              tipo === 'ouro1000'
                ? Number(configuracoes?.ouro1000 || 0)
                : Number(configuracoes?.[tipo] || 0);

            const pesoReal =
              parseFloat(lote.pesoLote ?? 0) -
              parseFloat(lote.descontoPesoPedra ?? 0);

            // 🔹 Sempre recalcula o lance com base na nova cotação
            const lanceAtualizado =
              valorCotacao * (isNaN(pesoReal) ? 0 : pesoReal);

            const novoLote = {
              ...lote,
              classificacao: tipo,
              cotacaoBase: valorCotacao,
              lance: lanceAtualizado,
            };

            setLotes((prev) =>
              prev.map((l) => (l.id === lote.id ? novoLote : l))
            );

            setCotacoesSelecionadas((prev) => ({
              ...prev,
              [lote.id]: tipo,
            }));
          }}
        >
          <option value="">Selecione</option>
          <option value="pecaComDiamante">
            Peça com Diamante (R$ {configuracoes?.pecaComDiamante?.toFixed(2)})
          </option>
          <option value="ouroBaixo">
            Ouro Baixo (R$ {configuracoes?.ouroBaixo?.toFixed(2)})
          </option>
          <option value="ouro750">
            Ouro 750 (R$ {configuracoes?.ouro750?.toFixed(2)})
          </option>
          <option value="ouro1000">
            Ouro 1000 (R$ {configuracoes?.ouro1000?.toFixed(2)})
          </option>
        </select>
      </td>

      {/* Cálculos */}
      <td>R$ {valor.toFixed(2)}</td>
      <td>R$ {lance.toFixed(2)}</td>
      <td>R$ {seisPorcento.toFixed(2)}</td>
      <td>R$ {total.toFixed(2)}</td>
      <td>{lote.descontoPesoPedra || 0}g</td>
      <td>{pesoLote.toFixed(2)}g</td>
      <td>{pesoReal.toFixed(2)}g</td>
      <td>R$ {valorPorGrama.toFixed(2)}</td>
      <td
        style={{
          color:
            ganhoEstimado > 0 ? 'green' : ganhoEstimado < 0 ? 'red' : '#333',
          fontWeight: 500,
        }}
      >
        R$ {ganhoEstimado.toFixed(2)}
      </td>

      {/* Ações */}
      <td>
        <div className={styles.actions}>
          <button className={styles.iconButton} onClick={() => onEdit(lote)}>
            🖊️
          </button>
          <button
            className={styles.iconButton}
            onClick={() => onDelete(lote.id)}
          >
            🗑️
          </button>
          <button
            className={styles.iconButton}
            onClick={() => onToggleVantajoso(lote, !isVantajoso)}
            title={
              isVantajoso ? 'Remover do carrinho' : 'Adicionar ao carrinho'
            }
          >
            {isVantajoso ? '🛒✅' : '🛒'}
          </button>
          <span>
            <input
              type="checkbox"
              checked={selecionados.includes(lote.id)}
              onChange={(e) => {
                if (e.target.checked)
                  setSelecionados((prev) => [...prev, lote.id]);
                else
                  setSelecionados((prev) =>
                    prev.filter((id) => id !== lote.id)
                  );
              }}
              className={styles.checkbox}
            />
          </span>
        </div>
      </td>
    </tr>
  );
};

export default LoteTableRow;
