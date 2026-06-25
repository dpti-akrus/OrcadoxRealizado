import { getCodUsuarioLogado, getUsuarioLogado } from "../../utils/session.js";

function obterCodigoUsuarioGlobal() {
  const codigoUsuario = getCodUsuarioLogado();
  return codigoUsuario > 0 ? codigoUsuario : null;
}

let resolvedorSessao = async () => {
  const usuario = getUsuarioLogado();
  return {
    codigoUsuario: usuario.codusu || obterCodigoUsuarioGlobal(),
    nomeUsuario: usuario.nome,
    emailUsuario: usuario.email
  };
};

export function configurarResolvedorSessao(resolvedor) {
  if (typeof resolvedor !== "function") throw new Error("O resolvedor de sessão deve ser uma função.");
  resolvedorSessao = resolvedor;
}

export async function obterSessaoAtual() {
  const sessao = await resolvedorSessao();
  return {
    ...sessao,
    codigoUsuario: sessao?.codigoUsuario ?? obterCodigoUsuarioGlobal()
  };
}
