export function getUsuarioLogado() {
  const contexto = typeof window === "undefined" ? {} : window;
  const usuario = contexto.SANKHYA_USER || {};
  const codusu = Number(usuario.codusu || contexto.UID || 0);

  return {
    // TODO: manter fallback 0 apenas para ambiente fora do Sankhya ou sessao indisponivel.
    codusu: Number.isFinite(codusu) && codusu > 0 ? codusu : 0,
    nome: usuario.nome || contexto.NOMEUSU || "",
    email: usuario.email || contexto.USERMAIL || ""
  };
}

export function getCodUsuarioLogado() {
  return getUsuarioLogado().codusu;
}
