// src/utils/calculoLote_excelLike.js (ou o arquivo que você estiver usando)
import { cotacaoDoTipo } from './cotacaoDoTipo';

export function calcularTotaisExcelLike(lote, cotacoes) {
  const toNum = (v, def = 0) => {
    if (v === '' || v === null || v === undefined) return def;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? def : n;
  };

  // ✅ este faltava no retorno
  const valor = toNum(lote.valor, 0);

  const pesoLote = toNum(lote.pesoLote);
  const descontoPesoPedra = toNum(lote.descontoPesoPedra);
  const pesoReal = Math.max(0, pesoLote - descontoPesoPedra);

  const cotacao = lote.classificacao
    ? cotacaoDoTipo(lote.classificacao, cotacoes)
    : 0;

  const temLanceManual =
    lote.lance !== undefined &&
    lote.lance !== null &&
    String(lote.lance) !== '' &&
    !Number.isNaN(Number(lote.lance));

  const lance = temLanceManual ? toNum(lote.lance) : cotacao * pesoReal;

  const percentualExtra = toNum(lote.percentualExtra, 6);
  const seisPorcento = lance > 0 ? lance * (percentualExtra / 100) : 0;
  const total = lance > 0 ? lance + seisPorcento : 0;

  const valorPorGrama = pesoReal > 0 ? total / pesoReal : 0;
  const ganhoEstimado = lance > 0 ? pesoReal * cotacao - total : 0;

  return {
    // ✅ agora retorna valor
    valor,
    cotacaoBase: cotacao,
    pesoLote,
    desconto: descontoPesoPedra,
    pesoReal,
    lance,
    seisPorcento,
    total,
    valorPorGrama,
    ganhoEstimado,
  };
}
