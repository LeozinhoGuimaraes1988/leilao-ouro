// import React, { useState, useEffect } from 'react';
// import styles from './NovoLoteModal.module.css';

// const NovoLoteModal = ({ onClose, onAdd }) => {
//   const [configuracoes, setConfiguracoes] = useState(null);
//   const [form, setForm] = useState({
//     codigo: '',
//     descricao: '',
//     classificacao: '',
//     valor: '',
//     lance: '',
//     pesoBruto: '',
//     descontoPeso: '',
//   });

//   useEffect(() => {
//     const fetchConfiguracoes = async () => {
//       try {
//         const res = await fetch(
//           'http://localhost:3001/api/configuracoes-cotacao'
//         );
//         const data = await res.json();
//         setConfiguracoes({
//           ouro750: Number(data.percentuais.ouro750),
//           ouroBaixo: Number(data.percentuais.ouroBaixo),
//           pecaComDiamante: Number(data.percentuais.pecaComDiamante),
//         });
//       } catch (error) {
//         console.error('Erro ao buscar configurações:', error);
//       }
//     };

//     fetchConfiguracoes();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const {
//       codigo,
//       descricao,
//       classificacao,
//       valor,
//       lance,
//       pesoBruto,
//       descontoPeso,
//     } = form;

//     if (
//       !codigo ||
//       !descricao ||
//       !classificacao ||
//       !valor ||
//       !lance ||
//       !pesoBruto ||
//       !descontoPeso
//     ) {
//       alert('Preencha todos os campos.');
//       return;
//     }

//     const novoLote = {
//       numeroLote: codigo,
//       descricao,
//       classificacao,
//       valor: parseFloat(valor),
//       lance: parseFloat(lance),
//       pesoLote: parseFloat(pesoBruto),
//       descontoPesoPedra: parseFloat(descontoPeso),
//       percentualExtra: 6, // padrão
//     };

//     onAdd(novoLote);
//     onClose();
//   };

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <h2>Novo Lote</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             name="codigo"
//             placeholder="Código do lote"
//             value={form.codigo}
//             onChange={handleChange}
//           />
//           <textarea
//             name="descricao"
//             placeholder="Descrição do lote"
//             value={form.descricao}
//             onChange={handleChange}
//           />
//           <select
//             className={styles.select}
//             name="classificacao"
//             value={form.classificacao}
//             onChange={handleChange}
//             required
//           >
//             {!configuracoes ? (
//               <option>Carregando cotações...</option>
//             ) : (
//               <>
//                 <option value="">Tipo de cotação</option>
//                 <option value="pecaComDiamante">
//                   Peça com Diamante ({configuracoes.pecaComDiamante}% do ouro
//                   750)
//                 </option>
//                 <option value="ouroBaixo">
//                   Ouro Baixo ({configuracoes.ouroBaixo}% do ouro 1000)
//                 </option>
//                 <option value="ouro750">
//                   Ouro 750 ({configuracoes.ouro750}% do ouro 1000)
//                 </option>
//                 <option value="ouro1000">Ouro 1000 (100%)</option>
//               </>
//             )}
//           </select>

//           <input
//             name="valor"
//             type="number"
//             step="0.01"
//             placeholder="Valor do lote (R$)"
//             value={form.valor}
//             onChange={handleChange}
//           />
//           <input
//             name="lance"
//             type="number"
//             step="0.01"
//             placeholder="Lance (R$)"
//             value={form.lance}
//             onChange={handleChange}
//           />
//           <input
//             name="pesoBruto"
//             type="number"
//             step="0.01"
//             placeholder="Peso bruto (g)"
//             value={form.pesoBruto}
//             onChange={handleChange}
//           />
//           <input
//             name="descontoPeso"
//             type="number"
//             step="0.01"
//             placeholder="Desconto pedra (g)"
//             value={form.descontoPeso}
//             onChange={handleChange}
//           />
//           <div className={styles.btnGroup}>
//             <div className={styles.salvar}>
//               <button type="submit">Salvar</button>
//             </div>
//             <div className={styles.cancel}>
//               <button type="button" onClick={onClose}>
//                 Cancelar
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default NovoLoteModal;
