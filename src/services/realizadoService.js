import { TABELAS } from "../constants/database.js";
import { criarPeriodoMensal } from "../helpers/dateHelpers.js";
import { buscarDados } from "./sankhya/nativeSqlService.js";
import { criarFiltros } from "./serviceHelpers.js";

export async function buscarRealizado({
  exercicio,
  mesInicial = 1,
  mesFinal = 12,
  codigoEmpresa,
  codigoCentroResultado,
  codigoConta
}) {
  const periodo = criarPeriodoMensal(Number(exercicio), Number(mesInicial), Number(mesFinal));

  return buscarDados({
    tabela: TABELAS.META_CONTABIL,
    campos: ["CODEMP", "CODCENCUS", "CODCTACTB", "DTREF", "PREVISTO", "REALIZADO", "RECDESP"],
    filtros: criarFiltros({
      CODEMP: codigoEmpresa,
      CODCENCUS: codigoCentroResultado,
      CODCTACTB: codigoConta
    }),
    periodo: { campo: "DTREF", ...periodo },
    ordenacao: [
      { campo: "CODEMP", direcao: "asc" },
      { campo: "CODCENCUS", direcao: "asc" },
      { campo: "CODCTACTB", direcao: "asc" },
      { campo: "DTREF", direcao: "asc" }
    ]
  });
}

