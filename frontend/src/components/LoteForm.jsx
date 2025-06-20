import React, { useState } from 'react';
import styles from './LoteForm.module.css';

const LoteForm = ({ onAddLote }) => {
  const [lote, setLote] = useState({
    codigo: '',
    classificacao: '',
    lance: '',
    pesoBruto: '',
    descontoPeso: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    const camposObrigatorios = [
      'codigo',
      'classificacao',
      'lance',
      'pesoBruto',
      'descontoPeso',
    ];
    const preenchido = camposObrigatorios.every((campo) => lote[campo] !== '');

    if (!preenchido) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    onAddLote(lote);

    // Limpa o formulário
    setLote({
      codigo: '',
      classificacao: '',
      lance: '',
      pesoBruto: '',
      descontoPeso: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        name="codigo"
        placeholder="Código do lote"
        value={lote.codigo}
        onChange={handleChange}
        required
      />
      <select
        name="classificacao"
        value={lote.classificacao}
        onChange={handleChange}
        required
      >
        <option value="">Selecione o tipo de cotação</option>
        <option value="pecaComDiamante">Peça com Diamante</option>
        <option value="ouroBaixo">Ouro Baixo</option>
        <option value="ouro750">Ouro 750</option>
        <option value="ouro1000">Ouro 1000</option>
      </select>

      <input
        name="lance"
        type="number"
        step="0.01"
        placeholder="Lance (R$)"
        value={lote.lance}
        onChange={handleChange}
        required
      />
      <input
        name="pesoBruto"
        type="number"
        step="0.01"
        placeholder="Peso bruto (g)"
        value={lote.pesoBruto}
        onChange={handleChange}
        required
      />
      <input
        name="descontoPeso"
        type="number"
        step="0.01"
        placeholder="Desconto pedra (g)"
        value={lote.descontoPeso}
        onChange={handleChange}
        required
      />
      <div className={styles.addBtn}>
        <button type="submit">Adicionar Lote</button>
      </div>
    </form>
  );
};

export default LoteForm;
