// src/utils/calculoLote.js
export function calcularTotaisDoLote(lote, cotacoes) {
  const toNum = (v, def = 0) => {
    if (v === '' || v === null || v === undefined) return def;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? def : n;
  };

  const valor = toNum(lote.valor);
  const pesoLote = toNum(lote.pesoLote);
  const desconto = toNum(lote.descontoPesoPedra);
  const pesoReal = Math.max(0, pesoLote - desconto);

  // cotação vem da classificação + objeto de cotações
  const cotacaoBase = lote.classificacao
    ? toNum(cotacoes?.[lote.classificacao], 0)
    : 0;

  const classificacaoSelecionada = Boolean(
    lote.classificacao && lote.classificacao !== ''
  );

  // lance "definido" = tem número (0 conta como definido)
  const lanceFoiDefinido =
    lote.lance !== undefined &&
    lote.lance !== null &&
    String(lote.lance) !== '' &&
    !Number.isNaN(Number(lote.lance));

  // regra:
  // - se o lance não foi definido (''/undefined/null) e há classificação -> sugere (cotacaoBase * pesoReal)
  // - se foi definido (inclui 0), usa o valor definido
  const lance = lanceFoiDefinido
    ? toNum(lote.lance)
    : classificacaoSelecionada
    ? cotacaoBase * pesoReal
    : 0;

  const percentualExtra = toNum(lote.percentualExtra, 6);

  // ⚠️ Só calcula totais/ganho se houver classificação E lance > 0
  const podeCalcular = classificacaoSelecionada && lance > 0;

  const seisPorcento = podeCalcular ? lance * (percentualExtra / 100) : 0;
  const total = podeCalcular ? lance + seisPorcento : 0;
  const valorPorGrama = podeCalcular && pesoReal > 0 ? total / pesoReal : 0;
  const ganhoEstimado = podeCalcular ? pesoReal * cotacaoBase - total : 0;

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
