import React, { useState } from 'react';
import styles from './CarrinhoCompras.module.css';
import { jsPDF } from 'jspdf';

const CarrinhoCompras = ({
  lotesVantajosos,
  onRemoverLote,
  onLimparCarrinho,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  const calcularTotais = () => {
    return lotesVantajosos.reduce(
      (acc, lote) => {
        acc.totalLances += parseFloat(lote.total ?? lote.lance ?? 0);
        acc.ganhoEstimado += parseFloat(lote.ganhoEstimado || 0);
        acc.pesoTotal +=
          parseFloat(lote.pesoLote || 0) -
          parseFloat(lote.descontoPesoPedra || 0);
        return acc;
      },
      { totalLances: 0, ganhoEstimado: 0, pesoTotal: 0 }
    );
  };

  const gerarRelatorioPDF = () => {
    if (!lotesVantajosos?.length) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const titulo = 'Relatório do Carrinho';
    const subtitulo = 'Itens selecionados';
    const margemEsq = 15;
    const margemDir = 195;
    const linhaAltura = 8;

    // Cabeçalho
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(titulo, margemEsq, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo, margemEsq, 28);

    // Cabeçalho da tabela
    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Número do lote', margemEsq, y);
    doc.text('Lance', 130, y);
    doc.setDrawColor(0);
    doc.line(margemEsq, y + 2, margemDir, y + 2);
    y += 10;

    // Linhas da tabela
    doc.setFont('helvetica', 'normal');
    lotesVantajosos.forEach((lote) => {
      const numero = lote.numeroLote ?? lote.lote ?? '-';
      const lanceVal = Number(lote.lance ?? lote.total ?? 0);
      const lanceFmt = formatCurrency(lanceVal);

      // quebra de página se necessário
      if (y > 280) {
        doc.addPage();
        y = 20;

        doc.setFont('helvetica', 'bold');
        doc.text('Número do lote', margemEsq, y);
        doc.text('Lance', 130, y);
        doc.line(margemEsq, y + 2, margemDir, y + 2);
        y += 10;
        doc.setFont('helvetica', 'normal');
      }

      doc.text(String(numero), margemEsq, y);
      doc.text(lanceFmt, 130, y, { align: 'left' });

      y += linhaAltura;
    });

    // Rodapé com totais
    const totais = calcularTotais();
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Totais', margemEsq, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Total de Lances: ${formatCurrency(totais.totalLances)}`,
      margemEsq,
      y + 12
    );

    // Salvar
    doc.save('relatorio-carrinho.pdf');
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
                  <div>Total Lances: {formatCurrency(totais.totalLances)}</div>
                  <div>
                    Ganho Estimado: {formatCurrency(totais.ganhoEstimado)}
                  </div>
                  <div>Peso Total: {totais.pesoTotal.toFixed(2)}g</div>
                </div>

                <div className={styles.acoes}>
                  <button onClick={gerarRelatorioPDF}>
                    📄 Gerar Relatório
                  </button>
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
