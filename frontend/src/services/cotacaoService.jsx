// import axios from 'axios';

// const API_URL = 'http://localhost:3001/api/cotacao-ouro';
// const VALOR_FALLBACK = 631.0;

// export const buscarCotacaoOuro = async () => {
//   try {
//     const response = await axios.get(API_URL);
//     return response.data.preco || VALOR_FALLBACK;
//   } catch (error) {
//     console.warn(
//       '⚠️ Erro ao buscar cotação via back-end. Usando fallback.',
//       error.message
//     );
//     return VALOR_FALLBACK;
//   }
// };
