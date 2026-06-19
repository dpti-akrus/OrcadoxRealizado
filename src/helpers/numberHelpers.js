export function converterValorDecimal(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const texto = String(valor ?? "").trim();
  if (!texto) return 0;

  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(numero) ? numero : 0;
}

export function arredondarMoeda(valor) {
  return Math.round((converterValorDecimal(valor) + Number.EPSILON) * 100) / 100;
}

export function somarValores(valores = []) {
  return arredondarMoeda(valores.reduce((total, valor) => total + converterValorDecimal(valor), 0));
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(converterValorDecimal(valor));
}

