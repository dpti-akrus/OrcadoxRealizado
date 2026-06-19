import { TABELAS } from "../constants/database.js";
import { atualizarDados, buscarDados, inserirDados } from "./sankhya/nativeSqlService.js";
import { criarAuditoria, criarFiltros, filtroIgual, somenteDados } from "./serviceHelpers.js";

export async function buscarContasSistema({ codigoEmpresa, termo, somenteAnaliticas = true, ativas = true } = {}) {
  const filtros = criarFiltros({ CODEMP: codigoEmpresa });
  if (somenteAnaliticas) filtros.push(filtroIgual("ANALITICA", "S"));
  if (ativas) filtros.push(filtroIgual("ATIVA", "S"));
  if (termo) filtros.push({ campo: "DESCRCTA", operador: "contains", valor: termo });

  return buscarDados({
    tabela: TABELAS.CONTA_CONTABIL,
    campos: ["CODCTACTB", "CTACTB", "DESCRCTA", "CODEMP", "ANALITICA", "ATIVA"],
    filtros,
    ordenacao: [{ campo: "CTACTB", direcao: "asc" }]
  });
}

export async function buscarContasOrcamentarias(filtros = {}) {
  return buscarDados({
    tabela: TABELAS.ORC_CONTA,
    campos: ["IDORCCTA", "CODCTACTB", "NOME", "DESCRICAO", "ATIVO", "CODUSUINC", "DHINC", "CODUSUALT", "DHALT"],
    filtros: criarFiltros({ CODCTACTB: filtros.codigoConta, ATIVO: filtros.ativo }),
    ordenacao: [{ campo: "NOME", direcao: "asc" }]
  });
}

export async function salvarContaOrcamentaria(dados) {
  const consulta = await buscarContasOrcamentarias({ codigoConta: dados.CODCTACTB });
  const existente = somenteDados(consulta)[0];
  if (existente) {
    await atualizarDados({
      tabela: TABELAS.ORC_CONTA,
      dados: { NOME: dados.NOME, DESCRICAO: dados.DESCRICAO, ATIVO: dados.ATIVO ?? "S", ...(await criarAuditoria()) },
      filtros: [filtroIgual("IDORCCTA", existente.IDORCCTA)]
    });
    return { ...existente, ...dados };
  }
  return inserirDados({
    tabela: TABELAS.ORC_CONTA,
    dados: { ...dados, ATIVO: dados.ATIVO ?? "S", ...(await criarAuditoria(true)) }
  });
}

export async function alterarStatusContaOrcamentaria(id, ativo) {
  return atualizarDados({
    tabela: TABELAS.ORC_CONTA,
    dados: { ATIVO: ativo ? "S" : "N", ...(await criarAuditoria()) },
    filtros: [filtroIgual("IDORCCTA", id)]
  });
}

