import { useMemo } from 'react';

export function useCalculoLote(lote) {
  return useMemo(() => {
    const valor = lote.valor ?? 0;
    const cotacaoBase = lote.cotacaoBase ?? 0;
    const pesoLote = parseFloat(lote.pesoLote) || 0;
    const desconto = parseFloat(lote.descontoPesoPedra) || 0;
    const pesoReal = pesoLote - desconto;

    const deveCalcular = lote.classificacao && lote.classificacao !== '';

    const lance =
      typeof lote.lance === 'number' && lote.lance > 0
        ? lote.lance
        : deveCalcular
        ? cotacaoBase * pesoReal
        : 0;

    const seisPorcento = deveCalcular ? lance * 0.06 : 0;
    const total = deveCalcular ? lance + seisPorcento : 0;
    const valorPorGrama = deveCalcular && pesoReal > 0 ? total / pesoReal : 0;
    const ganhoEstimado = deveCalcular ? pesoReal * cotacaoBase - total : 0;

    return {
      valor,
      cotacaoBase,
      pesoLote,
      desconto,
      pesoReal,
      lance,
      seisPorcento,
      total,
      valorPorGrama,
      ganhoEstimado,
    };
  }, [lote]);
}
