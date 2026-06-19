import { obterSessaoAtual } from "./sankhya/sessionService.js";

export function filtroIgual(campo, valor) {
  return { campo, operador: "eq", valor };
}

export function criarFiltros(definicoes = {}) {
  return Object.entries(definicoes)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== "")
    .map(([campo, valor]) => filtroIgual(campo, valor));
}

export async function criarAuditoria(inclusao = false) {
  const { codigoUsuario } = await obterSessaoAtual();
  const agora = new Date().toISOString();

  return inclusao
    ? { CODUSUINC: codigoUsuario, DHINC: agora, CODUSUALT: codigoUsuario, DHALT: agora }
    : { CODUSUALT: codigoUsuario, DHALT: agora };
}

export function somenteDados(resultado) {
  return resultado?.dados || [];
}

