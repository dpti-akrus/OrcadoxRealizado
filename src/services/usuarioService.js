// Reset controlado: usuarios sem integracao real nesta etapa.
const emptyResult = Object.freeze({ dados: [], total: 0 });

export async function buscarUsuarios() { return emptyResult; }
export async function buscarUsuarioSistemaPorCodigo() { return null; }
export async function salvarUsuario() { return null; }
