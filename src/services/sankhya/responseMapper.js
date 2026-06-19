export function normalizarLinhas(resposta) {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.rows)) return resposta.rows;
  if (Array.isArray(resposta?.data)) return resposta.data;
  if (Array.isArray(resposta?.responseBody?.rows)) return resposta.responseBody.rows;
  return [];
}

export function mapearRegistro(registro, mapeamento) {
  return Object.fromEntries(
    Object.entries(mapeamento).map(([destino, origem]) => [
      destino,
      typeof origem === "function" ? origem(registro) : registro[origem]
    ])
  );
}

