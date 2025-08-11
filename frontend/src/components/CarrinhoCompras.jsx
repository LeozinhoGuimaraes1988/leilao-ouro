import React, { useState } from 'react';
import styles from './CarrinhoCompras.module.css';

const CarrinhoCompras = ({
  lotesVantajosos,
  onRemoverLote,
  onLimparCarrinho,
  //   onExportarCarrinho,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const calcularTotais = () => {
    return lotesVantajosos.reduce(
      (acc, lote) => {
        acc.totalLances += parseFloat(lote.total || 0);
        acc.ganhoEstimado += parseFloat(lote.ganhoEstimado || 0);
        acc.pesoTotal +=
          parseFloat(lote.pesoLote || 0) -
          parseFloat(lote.descontoPesoPedra || 0);

        return acc;
      },
      {
        totalLances: 0,
        ganhoEstimado: 0,
        pesoTotal: 0,
      }
    );
  };

  const totais = calcularTotais();

  return (
    <div className={styles.carrinho}>
      <button
        className={styles.carrinhoToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        🛒 {lotesVantajosos.length}
      </button>

      {isOpen && (
        <div className={styles.carrinhoModal}>
          <div className={styles.carrinhoHeader}>
            <h3>Lotes Vantajosos</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className={styles.carrinhoContent}>
            {lotesVantajosos.length === 0 ? (
              <p>Nenhum lote selecionado</p>
            ) : (
              <>
                <div className={styles.lotesList}>
                  {lotesVantajosos.map((lote) => (
                    <div key={lote.id} className={styles.loteItem}>
                      <span>#{lote.numeroLote || lote.lote}</span>
                      <span>{lote.descricao}</span>
                      <button onClick={() => onRemoverLote(lote.id)}>🗑️</button>
                    </div>
                  ))}
                </div>

                <div className={styles.totais}>
                  <div>Total Lances: R$ {totais.totalLances.toFixed(2)}</div>
                  <div>
                    Ganho Estimado: R$ {totais.ganhoEstimado.toFixed(2)}
                  </div>
                  <div>Peso Total: {totais.pesoTotal.toFixed(2)}g</div>
                </div>

                <div className={styles.acoes}>
                  {/* <button onClick={onExportarCarrinho}>📊 Exportar</button> */}
                  <button onClick={onLimparCarrinho}>🗑️ Limpar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CarrinhoCompras;
