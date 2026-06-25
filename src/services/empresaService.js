// Reset controlado: cadastro de grupos/empresas sem integracao real nesta etapa.
const emptyResult = Object.freeze({ dados: [], total: 0 });

export async function buscarGruposEmpresariais() { return emptyResult; }
export async function buscarEmpresas() { return emptyResult; }
export async function salvarGrupoEmpresarial() { return null; }
export async function salvarEmpresa() { return null; }
export async function alterarStatusGrupoEmpresarial() { return null; }
export async function alterarStatusEmpresa() { return null; }
