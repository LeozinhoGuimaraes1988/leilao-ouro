// utils/cotacaoDoTipo.js
export function cotacaoDoTipo(classificacao, cotacoes) {
  // Map da sua planilha: 1=Diamante, 2=Baixo, 3=750, senão 1000
  switch (String(classificacao)) {
    case '1':
    case 'pecaComDiamante':
      return Number(cotacoes?.pecaComDiamante || 0);
    case '2':
    case 'ouroBaixo':
      return Number(cotacoes?.ouroBaixo || 0);
    case '3':
    case 'ouro750':
      return Number(cotacoes?.ouro750 || 0);
    default:
    case '4':
    case 'ouro1000':
      return Number(cotacoes?.ouro1000 || 0);
  }
}
