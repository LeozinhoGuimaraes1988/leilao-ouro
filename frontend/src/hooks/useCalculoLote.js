import { useMemo } from 'react';
import { calcularTotaisDoLote } from '../utils/calculoLote';

export function useCalculoLote(lote) {
  return useMemo(() => calcularTotaisDoLote(lote), [lote]);
}
