import { TABELAS } from "../constants/database.js";
import { atualizarDados, buscarDados, inserirDados } from "./sankhya/nativeSqlService.js";
import { criarAuditoria, criarFiltros, filtroIgual, somenteDados } from "./serviceHelpers.js";

export async function buscarEmpresasSistema({ termo, ativas = true, pagina = 1, tamanho = 50 } = {}) {
  const filtros = [];
  if (ativas) filtros.push(filtroIgual("ATIVO", "S"));
  if (termo) filtros.push({ campo: "NOMEFANTASIA", operador: "contains", valor: termo });

  return buscarDados({
    tabela: TABELAS.EMPRESA,
    campos: ["CODEMP", "NOMEFANTASIA", "RAZAOSOCIAL", "CGC", "ATIVO"],
    filtros,
    ordenacao: [{ campo: "NOMEFANTASIA", direcao: "asc" }],
    paginacao: { pagina, tamanho }
  });
}

export async function buscarEmpresas(filtros = {}) {
  return buscarDados({
    tabela: TABELAS.ORC_EMPRESA,
    campos: ["IDORCEMP", "CODEMP", "NOME", "ATIVO", "CODUSUINC", "DHINC", "CODUSUALT", "DHALT"],
    filtros: criarFiltros({ CODEMP: filtros.codigoEmpresa, ATIVO: filtros.ativo }),
    ordenacao: [{ campo: "NOME", direcao: "asc" }]
  });
}

export async function buscarEmpresaPorCodigo(codigoEmpresa) {
  const resultado = await buscarEmpresas({ codigoEmpresa });
  return somenteDados(resultado)[0] || null;
}

export async function salvarEmpresa(dados) {
  const existente = await buscarEmpresaPorCodigo(dados.CODEMP);
  if (existente) {
    await atualizarDados({
      tabela: TABELAS.ORC_EMPRESA,
      dados: { NOME: dados.NOME, ATIVO: dados.ATIVO ?? "S", ...(await criarAuditoria()) },
      filtros: [filtroIgual("IDORCEMP", existente.IDORCEMP)]
    });
    return { ...existente, ...dados };
  }

  return inserirDados({
    tabela: TABELAS.ORC_EMPRESA,
    dados: { ...dados, ATIVO: dados.ATIVO ?? "S", ...(await criarAuditoria(true)) }
  });
}

export async function alterarStatusEmpresa(id, ativo) {
  return atualizarDados({
    tabela: TABELAS.ORC_EMPRESA,
    dados: { ATIVO: ativo ? "S" : "N", ...(await criarAuditoria()) },
    filtros: [filtroIgual("IDORCEMP", id)]
  });
}

