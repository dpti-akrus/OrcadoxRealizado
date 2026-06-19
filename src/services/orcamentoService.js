import { TABELAS } from "../constants/database.js";
import { arredondarMoeda } from "../helpers/numberHelpers.js";
import { garantirOrcamentoValido } from "../validators/orcamentoValidator.js";
import {
  atualizarDados,
  buscarDados,
  executarTransacao,
  excluirDados,
  inserirDados
} from "./sankhya/nativeSqlService.js";
import { criarAuditoria, criarFiltros, filtroIgual, somenteDados } from "./serviceHelpers.js";

const CAMPOS_ORCAMENTO = [
  "NUORC", "EXERCICIO", "VERSAO", "CODEMP", "CODCENCUS", "CODCTACTB", "VLRORCADO",
  "STATUS", "OBSERVACAO", "CODUSURESP", "CODUSUINC", "DHINC", "CODUSUALT", "DHALT"
];

function filtrosChave(dados) {
  return criarFiltros({
    EXERCICIO: dados.EXERCICIO,
    VERSAO: dados.VERSAO,
    CODEMP: dados.CODEMP,
    CODCENCUS: dados.CODCENCUS,
    CODCTACTB: dados.CODCTACTB
  });
}

function prepararCabecalho(dados) {
  return {
    EXERCICIO: Number(dados.EXERCICIO),
    VERSAO: Number(dados.VERSAO),
    CODEMP: Number(dados.CODEMP),
    CODCENCUS: Number(dados.CODCENCUS),
    CODCTACTB: Number(dados.CODCTACTB),
    VLRORCADO: arredondarMoeda(dados.VLRORCADO),
    STATUS: dados.STATUS || "RASCUNHO",
    OBSERVACAO: dados.OBSERVACAO,
    CODUSURESP: dados.CODUSURESP
  };
}

export async function buscarLancamentos(filtros = {}) {
  const resultado = await buscarDados({
    tabela: TABELAS.ORCAMENTO,
    campos: CAMPOS_ORCAMENTO,
    filtros: criarFiltros({
      NUORC: filtros.numeroOrcamento,
      EXERCICIO: filtros.exercicio,
      VERSAO: filtros.versao,
      CODEMP: filtros.codigoEmpresa,
      CODCENCUS: filtros.codigoCentroResultado,
      CODCTACTB: filtros.codigoConta,
      STATUS: filtros.status
    }),
    ordenacao: [
      { campo: "EXERCICIO", direcao: "desc" },
      { campo: "CODEMP", direcao: "asc" },
      { campo: "CODCENCUS", direcao: "asc" },
      { campo: "CODCTACTB", direcao: "asc" }
    ],
    paginacao: filtros.paginacao
  });

  const orcamentos = somenteDados(resultado);
  if (!filtros.incluirMeses || !orcamentos.length) return resultado;

  const numeros = orcamentos.map((item) => item.NUORC);
  const filtrosMeses = [{ campo: "NUORC", operador: "in", valor: numeros }];
  if (filtros.mesInicial || filtros.mesFinal) {
    filtrosMeses.push({ campo: "MES", operador: "between", valor: [filtros.mesInicial || 1, filtros.mesFinal || 12] });
  }
  const meses = somenteDados(await buscarDados({
    tabela: TABELAS.ORCAMENTO_MES,
    campos: ["NUORC", "MES", "VLRORCADO", "CODUSUALT", "DHALT"],
    filtros: filtrosMeses,
    ordenacao: [{ campo: "MES", direcao: "asc" }]
  }));

  return {
    ...resultado,
    dados: orcamentos.map((orcamento) => ({
      ...orcamento,
      meses: meses.filter((mes) => mes.NUORC === orcamento.NUORC)
    }))
  };
}

export async function buscarLancamentoPorCodigo(numeroOrcamento) {
  const resultado = await buscarLancamentos({ numeroOrcamento, incluirMeses: true });
  return somenteDados(resultado)[0] || null;
}

export async function verificarDuplicidadeOrcamento(dados, numeroOrcamentoIgnorado) {
  const resultado = await buscarDados({
    tabela: TABELAS.ORCAMENTO,
    campos: ["NUORC"],
    filtros: filtrosChave(dados)
  });
  return somenteDados(resultado).some((item) => item.NUORC !== numeroOrcamentoIgnorado);
}

export async function salvarLancamentoOrcamentario(dados) {
  garantirOrcamentoValido(dados);
  if (await verificarDuplicidadeOrcamento(dados, dados.NUORC)) {
    throw new Error("Já existe orçamento para o exercício, versão, empresa, centro e conta informados.");
  }

  const cabecalho = prepararCabecalho(dados);
  return executarTransacao(async () => {
    let numeroOrcamento = dados.NUORC;
    if (numeroOrcamento) {
      await atualizarDados({
        tabela: TABELAS.ORCAMENTO,
        dados: { ...cabecalho, ...(await criarAuditoria()) },
        filtros: [filtroIgual("NUORC", numeroOrcamento)]
      });
      await excluirDados({ tabela: TABELAS.ORCAMENTO_MES, filtros: [filtroIgual("NUORC", numeroOrcamento)] });
    } else {
      const inserido = await inserirDados({
        tabela: TABELAS.ORCAMENTO,
        dados: { ...cabecalho, ...(await criarAuditoria(true)) }
      });
      numeroOrcamento = inserido.NUORC;
      if (numeroOrcamento === undefined || numeroOrcamento === null) {
        throw new Error("A inclusão do orçamento não retornou o campo NUORC.");
      }
    }

    const auditoriaMes = await criarAuditoria();
    for (const mes of dados.meses) {
      await inserirDados({
        tabela: TABELAS.ORCAMENTO_MES,
        dados: {
          NUORC: numeroOrcamento,
          MES: Number(mes.MES),
          VLRORCADO: arredondarMoeda(mes.VLRORCADO),
          ...auditoriaMes
        }
      });
    }
    return buscarLancamentoPorCodigo(numeroOrcamento);
  });
}

export async function alterarStatusOrcamento(numeroOrcamento, status) {
  return atualizarDados({
    tabela: TABELAS.ORCAMENTO,
    dados: { STATUS: status, ...(await criarAuditoria()) },
    filtros: [filtroIgual("NUORC", numeroOrcamento)]
  });
}

export async function excluirLancamentoOrcamentario(numeroOrcamento) {
  return executarTransacao(async () => {
    await excluirDados({ tabela: TABELAS.ORCAMENTO_MES, filtros: [filtroIgual("NUORC", numeroOrcamento)] });
    return excluirDados({ tabela: TABELAS.ORCAMENTO, filtros: [filtroIgual("NUORC", numeroOrcamento)] });
  });
}

