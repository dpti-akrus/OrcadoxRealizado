export function removerCamposVazios(objeto = {}) {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== undefined && valor !== null && valor !== "")
  );
}

export function selecionarCampos(objeto, campos = []) {
  if (!campos.length) return { ...objeto };

  return campos.reduce((resultado, campo) => {
    if (Object.prototype.hasOwnProperty.call(objeto, campo)) {
      resultado[campo] = objeto[campo];
    }
    return resultado;
  }, {});
}

export function compararValores(valorAtual, operador, valorFiltro) {
  switch (operador) {
    case "eq": return valorAtual === valorFiltro;
    case "ne": return valorAtual !== valorFiltro;
    case "gt": return valorAtual > valorFiltro;
    case "gte": return valorAtual >= valorFiltro;
    case "lt": return valorAtual < valorFiltro;
    case "lte": return valorAtual <= valorFiltro;
    case "in": return Array.isArray(valorFiltro) && valorFiltro.includes(valorAtual);
    case "notIn": return Array.isArray(valorFiltro) && !valorFiltro.includes(valorAtual);
    case "contains": return String(valorAtual ?? "").toLocaleLowerCase("pt-BR").includes(String(valorFiltro ?? "").toLocaleLowerCase("pt-BR"));
    case "startsWith": return String(valorAtual ?? "").toLocaleLowerCase("pt-BR").startsWith(String(valorFiltro ?? "").toLocaleLowerCase("pt-BR"));
    case "between": return Array.isArray(valorFiltro) && valorAtual >= valorFiltro[0] && valorAtual <= valorFiltro[1];
    case "isNull": return valorFiltro ? valorAtual == null : valorAtual != null;
    default: throw new Error(`Operador de filtro não suportado: ${operador}`);
  }
}

