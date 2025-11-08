export function classifyObrigacoes(obrigacoes = []) {
  return obrigacoes.reduce(
    (acc, item) => {
      if (item.tipo === 'obrigatoria') acc.obrigatorias.push(item);
      else acc.dispensadas.push(item);
      return acc;
    },
    { obrigatorias: [], dispensadas: [] }
  );
}
