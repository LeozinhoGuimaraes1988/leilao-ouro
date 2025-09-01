// src/components/EditarLoteModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './EditarLoteModal.module.css';

const EditarLoteModal = ({ lote, onClose, onSave }) => {
  const [form, setForm] = useState(null); // começa nulo pra evitar flicker

  // Preenche só UMA vez quando o modal abre
  useEffect(() => {
    if (!lote) return;

    const pesoReal =
      parseFloat(lote.pesoLote ?? 0) - parseFloat(lote.descontoPesoPedra ?? 0);
    const cotacaoBase = parseFloat(lote.cotacaoBase ?? 0);
    const lanceCalculado = cotacaoBase * (isNaN(pesoReal) ? 0 : pesoReal);

    setForm({
      ...lote,
      // ❗ Se lance for undefined/null/'' -> sugere; se for 0, mantém 0
      lance:
        lote.lance === undefined ||
        lote.lance === null ||
        String(lote.lance) === ''
          ? lanceCalculado
          : Number(lote.lance),
      pesoLote: Number(lote.pesoLote ?? 0),
      descontoPesoPedra: Number(lote.descontoPesoPedra ?? 0),
      percentualExtra: Number(lote.percentualExtra ?? 6),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda só ao montar

  if (!lote || !form) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsed =
      type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setForm((prev) => ({ ...prev, [name]: parsed }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toNum = (v, def = 0) => {
      if (v === '' || v === null || v === undefined) return def;
      const n = Number(String(v).replace(',', '.'));
      return Number.isNaN(n) ? def : n;
    };

    const payload = {
      ...form,
      id: form.id ?? lote.id,
      lance: toNum(form.lance, 0), // 0 é válido e deve ser preservado
      pesoLote: toNum(form.pesoLote, 0),
      descontoPesoPedra: toNum(form.descontoPesoPedra, 0),
      percentualExtra: toNum(form.percentualExtra ?? 6, 6),
    };

    await onSave(payload); // aguarda salvar no pai/back
    onClose(); // fecha depois
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Editar Lote #{lote.numeroLote}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.floatingGroup}>
            <input
              id="lance"
              name="lance"
              type="number"
              step="0.01"
              value={form.lance === '' ? '' : form.lance}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="lance">Lance (R$)</label>
          </div>

          <div className={styles.floatingGroup}>
            <input
              id="pesoLote"
              name="pesoLote"
              type="number"
              step="0.01"
              value={form.pesoLote === '' ? '' : form.pesoLote}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="pesoLote">Peso Lote</label>
          </div>

          <div className={styles.floatingGroup}>
            <input
              id="descontoPesoPedra"
              name="descontoPesoPedra"
              type="number"
              step="0.01"
              value={
                form.descontoPesoPedra === '' ? '' : form.descontoPesoPedra
              }
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="descontoPesoPedra">Desconto Peso Pedra</label>
          </div>

          <button type="submit" className={styles.salvar}>
            Salvar
          </button>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarLoteModal;
