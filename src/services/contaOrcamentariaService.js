// Reset controlado: cadastro de contas contabeis sem integracao real nesta etapa.
const emptyResult = Object.freeze({ dados: [], total: 0 });

export async function buscarContasOrcamentarias() { return emptyResult; }
export async function buscarContasSistema() { return emptyResult; }
export async function salvarContaOrcamentaria() { return null; }
export async function alterarStatusContaOrcamentaria() { return null; }
