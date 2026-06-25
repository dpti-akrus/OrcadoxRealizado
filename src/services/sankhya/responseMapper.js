const CAMPOS_CONHECIDOS = new Set([]);

function obterChaves(valor) {
  if (!valor || typeof valor !== "object") return [];
  try {
    return [...new Set([...Object.keys(valor), ...Object.getOwnPropertyNames(valor)])];
  } catch {
    return [];
  }
}

function ehObjeto(valor) {
  return valor !== null && typeof valor === "object";
}

function extrairValorCampo(valor) {
  if (ehObjeto(valor) && "$" in valor) return valor.$;
  if (ehObjeto(valor) && "value" in valor) return valor.value;
  if (ehObjeto(valor) && "valor" in valor) return valor.valor;
  return valor;
}

function pareceRegistro(valor) {
  if (!ehObjeto(valor) || Array.isArray(valor)) return false;

  const chaves = obterChaves(valor);
  if (!chaves.length) return false;

  return chaves.some((chave) => {
    const chaveUpper = chave.toUpperCase();
    return CAMPOS_CONHECIDOS.has(chaveUpper) || /^[A-Z][A-Z0-9_]*$/.test(chave);
  });
}

function normalizarRegistro(registro) {
  return Object.fromEntries(
    Object.entries(registro).map(([chave, valor]) => [chave, extrairValorCampo(valor)])
  );
}

function normalizarArray(lista, visitados) {
  const registros = lista
    .map((item) => {
      if (pareceRegistro(item)) return normalizarRegistro(item);
      const aninhados = coletarLinhas(item, visitados);
      return aninhados.length ? aninhados : null;
    })
    .filter(Boolean)
    .flat();

  return registros;
}

function obterArrayDireto(resposta) {
  const candidatos = [
    resposta?.rows,
    resposta?.row,
    resposta?.data,
    resposta?.records,
    resposta?.items,
    resposta?.values,
    resposta?.responseBody?.rows,
    resposta?.responseBody?.data,
    resposta?.responseBody?.records,
    resposta?.responseBody?.entidades?.entidade
  ];

  return candidatos.find((candidato) => Array.isArray(candidato));
}

function obterArrayLike(resposta) {
  if (!ehObjeto(resposta) || Array.isArray(resposta)) return null;
  if (!Number.isInteger(resposta.length) || resposta.length < 0) return null;

  const lista = [];
  for (let indice = 0; indice < resposta.length; indice += 1) {
    if (!(indice in resposta)) return null;
    lista.push(resposta[indice]);
  }

  return lista;
}

function obterIterable(resposta) {
  if (!ehObjeto(resposta) || Array.isArray(resposta) || typeof resposta[Symbol.iterator] !== "function") {
    return null;
  }

  try {
    return Array.from(resposta);
  } catch {
    return null;
  }
}

function tentarParseStringObjeto(resposta, visitados) {
  if (!ehObjeto(resposta) || typeof resposta.toString !== "function") return [];

  try {
    const texto = String(resposta).trim();
    if (!texto.startsWith("[") && !texto.startsWith("{")) return [];
    return coletarLinhas(texto, visitados);
  } catch {
    return [];
  }
}

function coletarLinhas(resposta, visitados = new Set()) {
  if (!resposta) return [];

  if (typeof resposta === "string") {
    try {
      return coletarLinhas(JSON.parse(resposta), visitados);
    } catch {
      return [];
    }
  }

  if (!ehObjeto(resposta)) return [];
  if (visitados.has(resposta)) return [];
  visitados.add(resposta);

  if (Array.isArray(resposta)) return normalizarArray(resposta, visitados);

  const arrayDireto = obterArrayDireto(resposta);
  if (arrayDireto) return normalizarArray(arrayDireto, visitados);

  const arrayLike = obterArrayLike(resposta);
  if (arrayLike) return normalizarArray(arrayLike, visitados);

  const iterable = obterIterable(resposta);
  if (iterable) return normalizarArray(iterable, visitados);

  if (pareceRegistro(resposta)) return [normalizarRegistro(resposta)];

  const valores = obterChaves(resposta).map((chave) => resposta[chave]);
  for (const valor of valores) {
    const linhas = coletarLinhas(valor, visitados);
    if (linhas.length) return linhas;
  }

  return tentarParseStringObjeto(resposta, visitados);
}

export function normalizarLinhas(resposta) {
  return coletarLinhas(resposta);
}

export function descreverFormatoResposta(resposta) {
  if (!ehObjeto(resposta)) {
    return { tipo: typeof resposta };
  }

  const chaves = obterChaves(resposta);
  return {
    tipo: resposta?.constructor?.name || typeof resposta,
    chaves,
    filhos: Object.fromEntries(
      chaves.slice(0, 8).map((chave) => [
        chave,
        {
          tipo: resposta[chave]?.constructor?.name || typeof resposta[chave],
          chaves: obterChaves(resposta[chave]).slice(0, 20)
        }
      ])
    )
  };
}

export function mapearRegistro(registro, mapeamento) {
  return Object.fromEntries(
    Object.entries(mapeamento).map(([destino, origem]) => [
      destino,
      typeof origem === "function" ? origem(registro) : registro[origem]
    ])
  );
}
