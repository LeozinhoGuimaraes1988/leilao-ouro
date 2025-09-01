// src/hooks/useCalculoLote.js
import { useMemo } from 'react';
import { calcularTotaisDoLote } from '../utils/calculoLote';

export function useCalculoLote(lote, cotacoes) {
  return useMemo(() => calcularTotaisDoLote(lote, cotacoes), [lote, cotacoes]);
}
