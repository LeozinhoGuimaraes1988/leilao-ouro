// src/hooks/useCalculoLote.js
// hooks/useCalculoLote.js
import { useMemo } from 'react';
import { calcularTotaisExcelLike } from '../utils/calculoLote';

export function useCalculoLote(lote, cotacoes) {
  return useMemo(
    () => calcularTotaisExcelLike(lote, cotacoes),
    [lote, cotacoes]
  );
}
