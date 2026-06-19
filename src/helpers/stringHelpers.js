export function normalizarTexto(valor) {
  return String(valor ?? "").trim().replace(/\s+/g, " ");
}

export function normalizarTextoParaBusca(valor) {
  return normalizarTexto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

