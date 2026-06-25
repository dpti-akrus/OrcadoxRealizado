// Reset controlado: consulta de realizado sem integracao real nesta etapa.
const emptyResult = Object.freeze({ dados: [], total: 0 });

export async function buscarRealizado() { return emptyResult; }
export async function buscarRealizadoPorPeriodo() { return emptyResult; }
