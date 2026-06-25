// Reset controlado: cadastro de centros de resultado sem integracao real nesta etapa.
const emptyResult = Object.freeze({ dados: [], total: 0 });

export async function buscarCentrosResultado() { return emptyResult; }
export async function buscarCentroSistemaPorCodigo() { return null; }
export async function salvarCentroResultado() { return null; }
export async function alterarStatusCentroResultado() { return null; }
