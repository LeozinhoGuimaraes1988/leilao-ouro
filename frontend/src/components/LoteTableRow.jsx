// src/components/LoteTableRow.jsx
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
  const {
    valor,
    pesoLote,
    pesoReal,
    lance,
    seisPorcento,
    total,
    valorPorGrama,
    ganhoEstimado,
  } = useCalculoLote(lote);

  const key = `${lote.id}-${lote.numeroLote}-${index}`;
  const isVantajoso = lotesVantajosos.some((l) => l.id === lote.id);

  return (
    <tr key={key}>
      {/* Lote */}
      <td>{lote.numeroLote}</td>

      {/* Selecionar (para exclusão em massa) */}

      {/* Número interno (ID) */}
      {/* <td>{lote.id}</td> */}

      {/* Descrição */}
      <td>{lote.descricao || '—'}</td>

      {/* Classificação (select) */}
      <td>
        <select
          className={styles.select}
          name="classificacao"
          value={cotacoesSelecionadas[lote.id] || ''}
          onChange={(e) => {
            const tipo = e.target.value;
            const valorCotacao = configuracoes?.[tipo] ?? 0;

            const novoLote = {
              ...lote,
              classificacao: tipo,
              cotacaoBase: valorCotacao,
              lance: 0,
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

      {/* Valor, Lance, 6%, Total */}
      <td>R$ {valor.toFixed(2)}</td>
      <td>R$ {lance.toFixed(2)}</td>
      <td>R$ {seisPorcento.toFixed(2)}</td>
      <td>R$ {total.toFixed(2)}</td>

      {/* Desconto, Pesos */}
      <td>{lote.descontoPesoPedra || 0}g</td>
      <td>{pesoLote.toFixed(2)}g</td>
      <td>{pesoReal.toFixed(2)}g</td>

      {/* Valor por grama */}
      <td>R$ {valorPorGrama.toFixed(2)}</td>

      {/* Estimativa de Ganho */}
      <td
        style={{
          color:
            ganhoEstimado > 0 ? 'green' : ganhoEstimado < 0 ? 'red' : '#333',
          fontWeight: 500,
        }}
      >
        R$ {ganhoEstimado.toFixed(2)}
      </td>

      {/* Ações: Editar, Excluir, Adicionar ao carrinho */}
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

          {/* Checkbox fica como um ELEMENTO dentro do MESMO td (span) */}
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
