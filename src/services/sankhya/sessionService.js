let resolvedorSessao = async () => ({ codigoUsuario: null });

export function configurarResolvedorSessao(resolvedor) {
  if (typeof resolvedor !== "function") throw new Error("O resolvedor de sessão deve ser uma função.");
  resolvedorSessao = resolvedor;
}

export async function obterSessaoAtual() {
  const sessao = await resolvedorSessao();
  return { codigoUsuario: sessao?.codigoUsuario ?? null, ...sessao };
}

