export function calcularTotaisDoLote(lote) {
  const toNum = (v, def = 0) => {
    if (v === '' || v === null || v === undefined) return def;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? def : n;
  };

  const valor = toNum(lote.valor);
  const cotacaoBase = toNum(lote.cotacaoBase);
  const pesoLote = toNum(lote.pesoLote);
  const desconto = toNum(lote.descontoPesoPedra);
  const pesoReal = Math.max(0, pesoLote - desconto);

  const deveCalcular = Boolean(lote.classificacao && lote.classificacao !== '');

  // ✅ aceita 0 e também strings "0"
  const temLance =
    lote.lance !== undefined &&
    lote.lance !== null &&
    !Number.isNaN(Number(lote.lance));
  const lance = temLance
    ? toNum(lote.lance)
    : deveCalcular
    ? cotacaoBase * pesoReal
    : 0;

  const percentualExtra = toNum(lote.percentualExtra, 6); // mantém 6% por padrão
  const seisPorcento = deveCalcular ? lance * (percentualExtra / 100) : 0;
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
}
