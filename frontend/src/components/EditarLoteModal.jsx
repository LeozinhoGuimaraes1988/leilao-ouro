import React, { useState, useEffect } from 'react';
import styles from './EditarLoteModal.module.css';

const EditarLoteModal = ({ lote, onClose, onSave }) => {
  const [form, setForm] = useState(lote);

  useEffect(() => {
    if (lote) {
      const pesoReal =
        parseFloat(lote.pesoLote) - parseFloat(lote.descontoPesoPedra || 0);
      const cotacaoBase = parseFloat(lote.cotacaoBase || 0);
      const lanceCalculado = cotacaoBase * pesoReal;

      setForm({
        ...lote,
        lance:
          Number.isNaN(lote.lance) || lote.lance === 0
            ? lanceCalculado
            : lote.lance,
      });
    }
  }, [lote]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      lance: parseFloat(form.lance),
      pesoLote: parseFloat(form.pesoLote),
      descontoPesoPedra: parseFloat(form.descontoPesoPedra),
      percentualExtra: parseFloat(form.percentualExtra || 6),
    });
    onClose();
  };

  if (!lote) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Editar Lote #{lote.numeroLote}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.floatingGroup}>
            <input
              id="lance"
              name="lance"
              value={form.lance}
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
              value={form.pesoLote}
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
              value={form.descontoPesoPedra}
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
