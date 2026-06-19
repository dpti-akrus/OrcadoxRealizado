import { compararValores, selecionarCampos } from "../../helpers/objectHelpers.js";
import { estaNoPeriodo, validarPeriodo } from "../../helpers/dateHelpers.js";

function clonar(valor) {
  if (valor instanceof Date) return new Date(valor.getTime());
  if (Array.isArray(valor)) return valor.map(clonar);
  if (valor && typeof valor === "object") {
    return Object.keys(valor).reduce((copia, chave) => {
      copia[chave] = clonar(valor[chave]);
      return copia;
    }, {});
  }
  return valor;
}

function atendeFiltros(registro, filtros = []) {
  return filtros.every(({ campo, operador = "eq", valor }) => compararValores(registro[campo], operador, valor));
}

function ordenar(registros, ordenacao = []) {
  return [...registros].sort((a, b) => {
    for (const { campo, direcao = "asc" } of ordenacao) {
      if (a[campo] === b[campo]) continue;
      const resultado = a[campo] > b[campo] ? 1 : -1;
      return direcao.toLowerCase() === "desc" ? -resultado : resultado;
    }
    return 0;
  });
}

export function criarAdaptadorMemoria(dadosIniciais = {}) {
  let tabelas = clonar(dadosIniciais);

  const adapter = {
    async buscar({ tabela, campos = [], filtros = [], periodo, ordenacao = [], paginacao }) {
      let registros = clonar(tabelas[tabela] || []).filter((registro) => atendeFiltros(registro, filtros));

      if (periodo) {
        const intervalo = validarPeriodo(periodo);
        registros = registros.filter((registro) => estaNoPeriodo(registro[periodo.campo], intervalo));
      }

      registros = ordenar(registros, ordenacao);
      const total = registros.length;
      if (paginacao) {
        const inicio = (paginacao.pagina - 1) * paginacao.tamanho;
        registros = registros.slice(inicio, inicio + paginacao.tamanho);
      }

      return { dados: registros.map((registro) => selecionarCampos(registro, campos)), total };
    },

    async inserir({ tabela, dados }) {
      tabelas[tabela] ||= [];
      const registro = clonar(dados);
      tabelas[tabela].push(registro);
      return clonar(registro);
    },

    async atualizar({ tabela, dados, filtros = [] }) {
      let quantidade = 0;
      tabelas[tabela] = (tabelas[tabela] || []).map((registro) => {
        if (!atendeFiltros(registro, filtros)) return registro;
        quantidade += 1;
        return { ...registro, ...clonar(dados) };
      });
      return { quantidade };
    },

    async excluir({ tabela, filtros = [] }) {
      const atuais = tabelas[tabela] || [];
      const restantes = atuais.filter((registro) => !atendeFiltros(registro, filtros));
      tabelas[tabela] = restantes;
      return { quantidade: atuais.length - restantes.length };
    },

    async transacao(operacao) {
      const snapshot = clonar(tabelas);
      try {
        return await operacao(adapter);
      } catch (error) {
        tabelas = snapshot;
        throw error;
      }
    }
  };

  return adapter;
}
