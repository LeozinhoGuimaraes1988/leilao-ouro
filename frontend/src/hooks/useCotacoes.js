// hooks/useCotacoes.js
import { useState, useEffect } from 'react';
import { buscarCotacaoOuro } from '../services/cotacaoService'; // ou outro serviço

export const useCotacoes = () => {
  const [cotacoes, setCotacoes] = useState({
    ouro1000: 0,
    ouro750: 0,
    pecaComDiamante: 0,
    ouroBaixo: 0,
  });

  useEffect(() => {
    const carregarCotacoes = async () => {
      const cotacaoOuro = await buscarCotacaoOuro(); // valor do ouro 1000

      const ouro1000 = cotacaoOuro;
      const ouro750 = 0.63 * ouro1000;
      const pecaComDiamante = 0.9 * ouro750;
      const ouroBaixo = 0.53 * ouro1000;

      setCotacoes({ ouro1000, ouro750, pecaComDiamante, ouroBaixo });
    };

    carregarCotacoes();
  }, []);

  return cotacoes;
};
