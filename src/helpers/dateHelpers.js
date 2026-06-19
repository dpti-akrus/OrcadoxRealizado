export function normalizarData(data) {
  if (data instanceof Date) return data;
  if (typeof data === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
  }
  return new Date(data);
}

export function validarPeriodo(periodo) {
  if (!periodo) return null;
  const inicio = normalizarData(periodo.inicio);
  const fim = normalizarData(periodo.fim);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    throw new Error("Período inválido. Informe datas de início e fim válidas.");
  }
  if (inicio > fim) throw new Error("A data inicial não pode ser posterior à data final.");

  return { ...periodo, inicio, fim };
}

export function criarPeriodoMensal(exercicio, mesInicial = 1, mesFinal = 12) {
  if (!Number.isInteger(exercicio) || mesInicial < 1 || mesFinal > 12 || mesInicial > mesFinal) {
    throw new Error("Exercício ou intervalo de meses inválido.");
  }

  return {
    inicio: new Date(exercicio, mesInicial - 1, 1),
    fim: new Date(exercicio, mesFinal, 0, 23, 59, 59, 999)
  };
}

export function estaNoPeriodo(valor, periodo) {
  const data = normalizarData(valor);
  return !Number.isNaN(data.getTime()) && data >= periodo.inicio && data <= periodo.fim;
}

