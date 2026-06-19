import { TABELAS } from "../constants/database.js";
import { atualizarDados, buscarDados, inserirDados } from "./sankhya/nativeSqlService.js";
import { criarAuditoria, criarFiltros, filtroIgual, somenteDados } from "./serviceHelpers.js";

export async function buscarCentrosSistema({ termo, ativos = true } = {}) {
  const filtros = [];
  if (ativos) filtros.push(filtroIgual("ATIVO", "S"));
  if (termo) filtros.push({ campo: "DESCRCENCUS", operador: "contains", valor: termo });
  return buscarDados({
    tabela: TABELAS.CENTRO_RESULTADO,
    campos: ["CODCENCUS", "DESCRCENCUS", "ATIVO"],
    filtros,
    ordenacao: [{ campo: "CODCENCUS", direcao: "asc" }]
  });
}

export async function buscarCentrosResultado(filtros = {}) {
  return buscarDados({
    tabela: TABELAS.ORC_CENTRO_RESULTADO,
    campos: ["ID", "CODCENCUS", "NOMEA", "ATIVO", "CODUSUINC", "DHINC", "CODUSUALT", "DHALT"],
    filtros: criarFiltros({ CODCENCUS: filtros.codigoCentroResultado, ATIVO: filtros.ativo }),
    ordenacao: [{ campo: "NOMEA", direcao: "asc" }]
  });
}

export async function salvarCentroResultado(dados) {
  const consulta = await buscarCentrosResultado({ codigoCentroResultado: dados.CODCENCUS });
  const existente = somenteDados(consulta)[0];
  if (existente) {
    await atualizarDados({
      tabela: TABELAS.ORC_CENTRO_RESULTADO,
      dados: { NOMEA: dados.NOMEA, ATIVO: dados.ATIVO ?? "S", ...(await criarAuditoria()) },
      filtros: [filtroIgual("ID", existente.ID)]
    });
    return { ...existente, ...dados };
  }
  return inserirDados({
    tabela: TABELAS.ORC_CENTRO_RESULTADO,
    dados: { ...dados, ATIVO: dados.ATIVO ?? "S", ...(await criarAuditoria(true)) }
  });
}

export async function alterarStatusCentroResultado(id, ativo) {
  return atualizarDados({
    tabela: TABELAS.ORC_CENTRO_RESULTADO,
    dados: { ATIVO: ativo ? "S" : "N", ...(await criarAuditoria()) },
    filtros: [filtroIgual("ID", id)]
  });
}

