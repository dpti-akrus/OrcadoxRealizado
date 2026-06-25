import { obterSessaoAtual } from "./sankhya/sessionService.js";
import { executarCrudSaveSankhya, executarConsultaSankhya } from "./sankhya/nativeSqlService.js";
import {
  buscarCentrosPermitidosUsuario,
  buscarPerfilUsuarioOrcamento,
  usuarioPodeAcessarCentro,
  validarAdministradorOrcamento
} from "./perfilUsuarioService.js";

function sqlListarOrcamentos(filtroRlsLancamento = "") {
  return `
SELECT
  O.NUORC,
  O.EXERCICIO,
  O.STATUS,
  CASE
    WHEN O.STATUS = 'E' THEN 'Em Elaboracao'
    WHEN O.STATUS = 'O' THEN 'Oficial'
    ELSE 'Indefinido'
  END AS STATUSDESC,
  O.CODPROJ,
  O.OBSERVACAO,
  O.CODUSURESP,
  O.DHINC,
  O.DHALT,
  NVL(SUM(L.VLRORCADO), 0) AS VLRORCADO,
  COUNT(L.IDORCLANC) AS QTDLANC
FROM AD_ORCAMENTO O
LEFT JOIN AD_ORCLANC L
  ON L.NUORC = O.NUORC
 AND NVL(L.ATIVA, 'S') = 'S'
 ${filtroRlsLancamento}
GROUP BY
  O.NUORC,
  O.EXERCICIO,
  O.STATUS,
  O.CODPROJ,
  O.OBSERVACAO,
  O.CODUSURESP,
  O.DHINC,
  O.DHALT
ORDER BY
  O.EXERCICIO DESC,
  O.NUORC DESC
`;
}

const SQL_PROXIMO_NUORC = `
SELECT NVL(MAX(NUORC), 0) + 1 AS PROXIMO
FROM AD_ORCAMENTO
`;

function sqlContarOrcamentoExercicio(exercicio) {
  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCAMENTO
WHERE EXERCICIO = ${exercicio}
`;
}

const SQL_PROXIMO_IDORCLANC = `
SELECT NVL(MAX(IDORCLANC), 0) + 1 AS PROXIMO
FROM AD_ORCLANC
`;

const SQL_PROXIMO_CODCCO_TCBMET = `
SELECT NVL(MAX(CODCCO), 0) + 1 AS PROXIMO
FROM TCBMET
`;

const SQL_LISTAR_EMPRESAS_ORCAMENTO = `
SELECT
  IDORCEMP,
  CODEMP,
  NOME AS NOMEFANTASIA
FROM AD_ORCEMP
WHERE NVL(ATIVO, 'S') = 'S'
ORDER BY CODEMP
`;

const SQL_LISTAR_CENTROS_RESULTADO_ORCAMENTO = `
SELECT
  ID AS IDORCCUS,
  CODCENCUS,
  NOME AS DESCRCENCUS
FROM AD_ORCCUS
WHERE NVL(ATIVO, 'S') = 'S'
ORDER BY CODCENCUS
`;

const SQL_LISTAR_CONTAS_CONTABEIS_ORCAMENTO = `
SELECT
  IDORCCTA,
  CODCTACTB,
  NVL(NOME, DESCRICAO) AS DESCRCTA
FROM AD_ORCCTA
WHERE NVL(ATIVA, 'S') = 'S'
ORDER BY CODCTACTB
`;

function sqlStatusOrcamento(nuorc) {
  return `
SELECT STATUS
FROM AD_ORCAMENTO
WHERE NUORC = ${nuorc}
`;
}

function sqlContarLancamentoDuplicado({ nuorc, idOrcEmp, idOrcCus, idOrcCta, mes, idOrcLancIgnorado }) {
  const filtroIgnorado = idOrcLancIgnorado ? `\n  AND IDORCLANC <> ${idOrcLancIgnorado}` : "";

  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCLANC
WHERE NUORC = ${nuorc}
  AND IDORCEMP = ${idOrcEmp}
  AND IDORCCUS = ${idOrcCus}
  AND IDORCCTA = ${idOrcCta}
  AND MES = ${mes}
  AND NVL(ATIVA, 'S') = 'S'${filtroIgnorado}
`;
}

function sqlExisteOrcEmp(idOrcEmp) {
  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCEMP
WHERE IDORCEMP = ${idOrcEmp}
`;
}

function sqlExisteOrcCus(idOrcCus) {
  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCCUS
WHERE ID = ${idOrcCus}
`;
}

function sqlExisteOrcCta(idOrcCta) {
  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCCTA
WHERE IDORCCTA = ${idOrcCta}
`;
}

function sqlDadosSincronizacaoTcbmet(nuorc) {
  return `
SELECT
  EMP.CODEMP,
  CUS.CODCENCUS,
  CTA.CODCTACTB,
  NVL(O.CODPROJ, 0) AS CODPROJ_SYNC,
  TO_CHAR(TO_DATE('01/' || LPAD(L.MES, 2, '0') || '/' || O.EXERCICIO, 'DD/MM/YYYY'), 'DD/MM/YYYY') AS DTREF,
  PLA.RECDESP,
  SUM(L.VLRORCADO) AS PREVISTO,
  COUNT(L.IDORCLANC) AS QTDLANC
FROM AD_ORCLANC L
INNER JOIN AD_ORCAMENTO O
  ON O.NUORC = L.NUORC
INNER JOIN AD_ORCEMP EMP
  ON EMP.IDORCEMP = L.IDORCEMP
INNER JOIN AD_ORCCUS CUS
  ON CUS.ID = L.IDORCCUS
INNER JOIN AD_ORCCTA CTA
  ON CTA.IDORCCTA = L.IDORCCTA
LEFT JOIN TCBPLA PLA
  ON PLA.CODCTACTB = CTA.CODCTACTB
WHERE L.NUORC = ${nuorc}
  AND NVL(L.ATIVA, 'S') = 'S'
GROUP BY
  EMP.CODEMP,
  CUS.CODCENCUS,
  CTA.CODCTACTB,
  NVL(O.CODPROJ, 0),
  TO_CHAR(TO_DATE('01/' || LPAD(L.MES, 2, '0') || '/' || O.EXERCICIO, 'DD/MM/YYYY'), 'DD/MM/YYYY'),
  PLA.RECDESP
ORDER BY
  EMP.CODEMP,
  CUS.CODCENCUS,
  CTA.CODCTACTB,
  DTREF
`;
}

function sqlBuscarTcbmetExistente({ codEmp, codCtaCtb, codProj, codCencus, dtRef, recDesp }) {
  return `
SELECT CODCCO
FROM TCBMET
WHERE CODEMP = ${codEmp}
  AND CODCTACTB = ${codCtaCtb}
  AND NVL(CODPROJ, 0) = ${codProj}
  AND CODCENCUS = ${codCencus}
  AND TRUNC(DTREF) = TO_DATE('${dtRef}', 'DD/MM/YYYY')
  AND RECDESP = ${formatarValorSql(recDesp)}
`;
}

function valorCampo(registro, campo) {
  if (!registro) return null;
  const chave = Object.keys(registro).find((item) => item.toUpperCase() === campo);
  return chave ? registro[chave] : null;
}

function numero(valor, fallback = 0) {
  const normalizado = typeof valor === "string" ? valor.replace(",", ".") : valor;
  const convertido = Number(normalizado);
  return Number.isFinite(convertido) ? convertido : fallback;
}

function texto(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function formatarValorSql(valor) {
  if (valor === null || valor === undefined || valor === "") return "NULL";
  const numeroValor = Number(valor);
  if (Number.isFinite(numeroValor)) return String(numeroValor);
  return `'${String(valor).replace(/'/g, "''")}'`;
}

function validarNuorc(nuorc) {
  const valor = Number(nuorc);
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error("Orçamento inválido para consulta de lançamentos.");
  }
  return valor;
}

function validarInteiroPositivo(valor, mensagem) {
  const convertido = Number(valor);
  if (!Number.isInteger(convertido) || convertido <= 0) {
    throw new Error(mensagem);
  }
  return convertido;
}

function validarMes(mes) {
  const convertido = Number(mes);
  if (!Number.isInteger(convertido) || convertido < 1 || convertido > 12) {
    throw new Error("Informe um mês válido entre 1 e 12.");
  }
  return convertido;
}

function validarValorOrcado(valor) {
  const textoValor = String(valor ?? "").replace(/\./g, "").replace(",", ".");
  const convertido = Number(textoValor);
  if (!Number.isFinite(convertido) || convertido < 0) {
    throw new Error("Informe um valor orçado maior ou igual a zero.");
  }
  return convertido;
}

function doisDigitos(valor) {
  return String(valor).padStart(2, "0");
}

function formatarDataHoraSankhya(data = new Date()) {
  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);
  const ano = data.getFullYear();
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());
  const segundo = doisDigitos(data.getSeconds());

  return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}

async function obterCodigoUsuarioAtual() {
  const sessao = await obterSessaoAtual();
  const codigoUsuario = Number(sessao?.codigoUsuario);

  // TODO: manter fallback 0 apenas para ambiente fora do Sankhya ou sessao indisponivel.
  return Number.isInteger(codigoUsuario) && codigoUsuario > 0 ? codigoUsuario : 0;
}

async function obterContextoRlsOrcamento() {
  const codigoUsuario = await obterCodigoUsuarioAtual();
  const perfil = await buscarPerfilUsuarioOrcamento(codigoUsuario);

  if (perfil.admin) {
    return { codigoUsuario, tipo: perfil.tipo, admin: true, leituraRestrita: false, escritaRestrita: false, centros: [], idsCentros: [] };
  }

  const centros = await buscarCentrosPermitidosUsuario(codigoUsuario);
  return {
    codigoUsuario,
    tipo: perfil.tipo,
    admin: false,
    leituraRestrita: perfil.tipo === "G",
    escritaRestrita: true,
    centros,
    idsCentros: centros.map((centro) => centro.idOrcCus).filter((id) => id > 0)
  };
}

function filtroRlsLancamento(contexto, alias = "L") {
  if (!contexto.leituraRestrita) return "";
  if (!contexto.idsCentros.length) return "AND 1 = 0";
  return `AND ${alias}.IDORCCUS IN (${contexto.idsCentros.join(",")})`;
}

async function validarRlsCentroLancamento(idOrcCus, mensagem, mensagemDiretoria = "") {
  const contexto = await obterContextoRlsOrcamento();

  if (!contexto.escritaRestrita) return true;

  if (!contexto.idsCentros.length) {
    throw new Error(
      contexto.tipo === "D"
        ? "Usuário Diretoria sem centro de resultado vinculado. Visualização liberada, mas lançamento bloqueado."
        : "Usuário sem centro de resultado vinculado. Solicite acesso ao administrador."
    );
  }

  if (!(await usuarioPodeAcessarCentro(contexto.codigoUsuario, idOrcCus))) {
    throw new Error(
      contexto.tipo === "D"
        ? mensagemDiretoria || "Diretoria possui visão geral, mas só pode lançar nos centros vinculados ao usuário."
        : mensagem
    );
  }

  return true;
}

async function validarUsuarioAdminOrcamento(mensagem = "Você não possui permissão para executar esta ação.") {
  const codigoUsuario = await obterCodigoUsuarioAtual();

  if (!(await validarAdministradorOrcamento(codigoUsuario))) {
    throw new Error(mensagem);
  }

  return true;
}

function sqlListarLancamentosPorOrcamento(nuorc, filtroRls = "") {
  return `
SELECT
  L.IDORCLANC,
  L.NUORC,
  L.IDORCEMP,
  EMP.NOME AS EMPRESA,
  L.IDORCCUS,
  CUS.NOME AS CENTRO_RESULTADO,
  L.IDORCCTA,
  NVL(CTA.NOME, CTA.DESCRICAO) AS CONTA_CONTABIL,
  L.MES,
  CASE
    WHEN L.MES = 1 THEN 'Janeiro'
    WHEN L.MES = 2 THEN 'Fevereiro'
    WHEN L.MES = 3 THEN 'Marco'
    WHEN L.MES = 4 THEN 'Abril'
    WHEN L.MES = 5 THEN 'Maio'
    WHEN L.MES = 6 THEN 'Junho'
    WHEN L.MES = 7 THEN 'Julho'
    WHEN L.MES = 8 THEN 'Agosto'
    WHEN L.MES = 9 THEN 'Setembro'
    WHEN L.MES = 10 THEN 'Outubro'
    WHEN L.MES = 11 THEN 'Novembro'
    WHEN L.MES = 12 THEN 'Dezembro'
    ELSE 'Indefinido'
  END AS MESDESC,
  L.VLRORCADO,
  L.DESCRLANC,
  L.OBSERVACAO,
  L.ORIGEM,
  L.ATIVA,
  L.DHINC,
  L.DHALT
FROM AD_ORCLANC L
LEFT JOIN AD_ORCEMP EMP
  ON EMP.IDORCEMP = L.IDORCEMP
LEFT JOIN AD_ORCCUS CUS
  ON CUS.ID = L.IDORCCUS
LEFT JOIN AD_ORCCTA CTA
  ON CTA.IDORCCTA = L.IDORCCTA
WHERE L.NUORC = ${nuorc}
  AND NVL(L.ATIVA, 'S') = 'S'
  ${filtroRls}
ORDER BY
  L.IDORCEMP,
  L.IDORCCUS,
  L.IDORCCTA,
  L.MES
`;
}

function sqlCentroLancamento(idOrcLanc, nuorc) {
  return `
SELECT IDORCCUS
FROM AD_ORCLANC
WHERE IDORCLANC = ${idOrcLanc}
  AND NUORC = ${nuorc}
`;
}

const SQL_LISTAR_LANCAMENTOS_INATIVOS = `
SELECT
  L.IDORCLANC,
  L.NUORC,
  O.EXERCICIO,
  L.IDORCEMP,
  EMP.NOME AS EMPRESA,
  L.IDORCCUS,
  CUS.NOME AS CENTRO_RESULTADO,
  L.IDORCCTA,
  NVL(CTA.NOME, CTA.DESCRICAO) AS CONTA_CONTABIL,
  L.MES,
  CASE
    WHEN L.MES = 1 THEN 'Janeiro'
    WHEN L.MES = 2 THEN 'Fevereiro'
    WHEN L.MES = 3 THEN 'Marco'
    WHEN L.MES = 4 THEN 'Abril'
    WHEN L.MES = 5 THEN 'Maio'
    WHEN L.MES = 6 THEN 'Junho'
    WHEN L.MES = 7 THEN 'Julho'
    WHEN L.MES = 8 THEN 'Agosto'
    WHEN L.MES = 9 THEN 'Setembro'
    WHEN L.MES = 10 THEN 'Outubro'
    WHEN L.MES = 11 THEN 'Novembro'
    WHEN L.MES = 12 THEN 'Dezembro'
    ELSE 'Indefinido'
  END AS MESDESC,
  L.VLRORCADO,
  L.DESCRLANC,
  L.OBSERVACAO,
  L.ORIGEM,
  L.ATIVA,
  L.CODUSUINC,
  USUINC.NOMEUSU AS NOMEUSUINC,
  L.DHINC,
  L.CODUSUALT AS CODUSUDESATIVACAO,
  USUALT.NOMEUSU AS NOMEUSUDESATIVACAO,
  L.DHALT AS DHDESATIVACAO
FROM AD_ORCLANC L
LEFT JOIN AD_ORCAMENTO O
  ON O.NUORC = L.NUORC
LEFT JOIN AD_ORCEMP EMP
  ON EMP.IDORCEMP = L.IDORCEMP
LEFT JOIN AD_ORCCUS CUS
  ON CUS.ID = L.IDORCCUS
LEFT JOIN AD_ORCCTA CTA
  ON CTA.IDORCCTA = L.IDORCCTA
LEFT JOIN TSIUSU USUINC
  ON USUINC.CODUSU = L.CODUSUINC
LEFT JOIN TSIUSU USUALT
  ON USUALT.CODUSU = L.CODUSUALT
WHERE NVL(L.ATIVA, 'S') = 'N'
ORDER BY
  L.DHALT DESC,
  L.IDORCLANC DESC
`;

function validarExercicio(exercicio) {
  const valorTexto = String(exercicio ?? "").trim();
  const valor = Number(valorTexto);

  if (!/^\d{4}$/.test(valorTexto) || !Number.isInteger(valor)) {
    throw new Error("Informe um exercício válido com 4 dígitos.");
  }

  return valor;
}

export function descreverStatus(status) {
  if (status === "E") return "Em Elaboracao";
  if (status === "O") return "Oficial";
  return "Indefinido";
}

function normalizarOrcamento(registro) {
  const status = texto(valorCampo(registro, "STATUS"));

  return {
    nuorc: numero(valorCampo(registro, "NUORC")),
    exercicio: numero(valorCampo(registro, "EXERCICIO")),
    status,
    statusDesc: texto(valorCampo(registro, "STATUSDESC")) || descreverStatus(status),
    codProj: texto(valorCampo(registro, "CODPROJ")),
    observacao: texto(valorCampo(registro, "OBSERVACAO")),
    codUsuResp: texto(valorCampo(registro, "CODUSURESP")),
    dhInc: texto(valorCampo(registro, "DHINC")),
    dhAlt: texto(valorCampo(registro, "DHALT")),
    vlrOrcado: numero(valorCampo(registro, "VLRORCADO")),
    qtdLanc: numero(valorCampo(registro, "QTDLANC"))
  };
}

export async function listarOrcamentos() {
  const contexto = await obterContextoRlsOrcamento();
  const registros = await executarConsultaSankhya(sqlListarOrcamentos(filtroRlsLancamento(contexto)));
  return registros.map(normalizarOrcamento);
}

function normalizarEmpresaOrcamento(registro) {
  return {
    idOrcEmp: numero(valorCampo(registro, "IDORCEMP")),
    codEmp: numero(valorCampo(registro, "CODEMP")),
    nomeFantasia: texto(valorCampo(registro, "NOMEFANTASIA"))
  };
}

function normalizarCentroResultadoOrcamento(registro) {
  return {
    idOrcCus: numero(valorCampo(registro, "IDORCCUS")),
    codCencus: numero(valorCampo(registro, "CODCENCUS")),
    descricao: texto(valorCampo(registro, "DESCRCENCUS"))
  };
}

function normalizarContaContabilOrcamento(registro) {
  return {
    idOrcCta: numero(valorCampo(registro, "IDORCCTA")),
    codCtaCtb: numero(valorCampo(registro, "CODCTACTB")),
    descricao: texto(valorCampo(registro, "DESCRCTA"))
  };
}

export async function listarEmpresasOrcamento() {
  const registros = await executarConsultaSankhya(SQL_LISTAR_EMPRESAS_ORCAMENTO);
  return registros.map(normalizarEmpresaOrcamento).filter((item) => item.idOrcEmp > 0);
}

export async function listarCentrosResultadoOrcamento() {
  const contexto = await obterContextoRlsOrcamento();

  if (!contexto.admin) {
    return contexto.centros;
  }

  const registros = await executarConsultaSankhya(SQL_LISTAR_CENTROS_RESULTADO_ORCAMENTO);
  return registros.map(normalizarCentroResultadoOrcamento).filter((item) => item.idOrcCus > 0);
}

export async function listarContasContabeisOrcamento() {
  const registros = await executarConsultaSankhya(SQL_LISTAR_CONTAS_CONTABEIS_ORCAMENTO);
  return registros.map(normalizarContaContabilOrcamento).filter((item) => item.idOrcCta > 0);
}

export async function obterProximoNuorc() {
  // TODO: trocar esta numeracao temporaria por sequence/trigger ou rotina transacional segura.
  const [registro] = await executarConsultaSankhya(SQL_PROXIMO_NUORC);
  return numero(valorCampo(registro, "PROXIMO"), 1);
}

export async function existeOrcamentoNoExercicio(exercicio) {
  const exercicioValidado = validarExercicio(exercicio);
  const [registro] = await executarConsultaSankhya(sqlContarOrcamentoExercicio(exercicioValidado));
  return numero(valorCampo(registro, "QTD")) > 0;
}

export async function criarOrcamentoAnual({ exercicio, codProj, observacao }) {
  await validarUsuarioAdminOrcamento();

  const exercicioValidado = validarExercicio(exercicio);
  const projetoInformado = String(codProj ?? "").trim();
  const observacaoInformada = String(observacao ?? "").trim();

  if (projetoInformado && !Number.isInteger(Number(projetoInformado))) {
    throw new Error("CODPROJ deve ser um número inteiro.");
  }

  if (await existeOrcamentoNoExercicio(exercicioValidado)) {
    throw new Error("Já existe orçamento cadastrado para este exercício.");
  }

  const nuorc = await obterProximoNuorc();
  const codigoUsuario = await obterCodigoUsuarioAtual();
  const dados = {
    NUORC: nuorc,
    EXERCICIO: exercicioValidado,
    STATUS: "E",
    CODUSURESP: codigoUsuario,
    CODUSUINC: codigoUsuario,
    DHINC: formatarDataHoraSankhya()
  };

  if (projetoInformado) dados.CODPROJ = Number(projetoInformado);
  if (observacaoInformada) dados.OBSERVACAO = observacaoInformada;

  await executarCrudSaveSankhya(dados, "AD_ORCAMENTO");

  return { nuorc, exercicio: exercicioValidado, status: "E" };
}

function normalizarLancamento(registro) {
  const idOrcLanc = numero(valorCampo(registro, "IDORCLANC"));
  if (!idOrcLanc) return null;

  return {
    idOrcLanc,
    nuorc: numero(valorCampo(registro, "NUORC")),
    idOrcEmp: numero(valorCampo(registro, "IDORCEMP")),
    empresa: texto(valorCampo(registro, "EMPRESA")),
    idOrcCus: numero(valorCampo(registro, "IDORCCUS")),
    centroResultado: texto(valorCampo(registro, "CENTRO_RESULTADO")),
    idOrcCta: numero(valorCampo(registro, "IDORCCTA")),
    contaContabil: texto(valorCampo(registro, "CONTA_CONTABIL")),
    mes: numero(valorCampo(registro, "MES")),
    mesDesc: texto(valorCampo(registro, "MESDESC")),
    vlrOrcado: numero(valorCampo(registro, "VLRORCADO")),
    descrLanc: texto(valorCampo(registro, "DESCRLANC")),
    observacao: texto(valorCampo(registro, "OBSERVACAO")),
    origem: texto(valorCampo(registro, "ORIGEM")),
    ativa: texto(valorCampo(registro, "ATIVA")) || "S",
    dhInc: texto(valorCampo(registro, "DHINC")),
    dhAlt: texto(valorCampo(registro, "DHALT"))
  };
}

export async function listarLancamentosPorOrcamento(nuorc) {
  const nuorcValidado = validarNuorc(nuorc);
  const contexto = await obterContextoRlsOrcamento();
  const registros = await executarConsultaSankhya(sqlListarLancamentosPorOrcamento(
    nuorcValidado,
    filtroRlsLancamento(contexto)
  ));
  return registros.map(normalizarLancamento).filter(Boolean);
}

export async function listarLancamentosInativos() {
  const registros = await executarConsultaSankhya(SQL_LISTAR_LANCAMENTOS_INATIVOS);
  return registros
    .map((registro) => {
      const lancamento = normalizarLancamento(registro);
      if (!lancamento) return null;
      return {
        ...lancamento,
        exercicio: numero(valorCampo(registro, "EXERCICIO")),
        codUsuInc: numero(valorCampo(registro, "CODUSUINC")),
        nomeUsuInc: texto(valorCampo(registro, "NOMEUSUINC")),
        codUsuDesativacao: numero(valorCampo(registro, "CODUSUDESATIVACAO")),
        nomeUsuDesativacao: texto(valorCampo(registro, "NOMEUSUDESATIVACAO")),
        dhDesativacao: texto(valorCampo(registro, "DHDESATIVACAO")) || lancamento.dhAlt
      };
    })
    .filter(Boolean);
}

export async function obterProximoIdOrcLanc() {
  // TODO: trocar esta numeracao temporaria por sequence/trigger ou rotina transacional segura.
  const [registro] = await executarConsultaSankhya(SQL_PROXIMO_IDORCLANC);
  return numero(valorCampo(registro, "PROXIMO"), 1);
}

export async function obterProximoCodCcoTcbmet() {
  // TODO: trocar esta numeracao temporaria por sequence/trigger ou rotina transacional segura do Sankhya.
  const [registro] = await executarConsultaSankhya(SQL_PROXIMO_CODCCO_TCBMET);
  return numero(valorCampo(registro, "PROXIMO"), 1);
}

function normalizarItemTcbmet(registro) {
  return {
    codEmp: numero(valorCampo(registro, "CODEMP")),
    codCencus: numero(valorCampo(registro, "CODCENCUS")),
    codCtaCtb: numero(valorCampo(registro, "CODCTACTB")),
    codProj: numero(valorCampo(registro, "CODPROJ_SYNC")),
    dtRef: texto(valorCampo(registro, "DTREF")),
    recDesp: texto(valorCampo(registro, "RECDESP")),
    previsto: numero(valorCampo(registro, "PREVISTO")),
    qtdLanc: numero(valorCampo(registro, "QTDLANC"))
  };
}

async function listarItensSincronizacaoTcbmet(nuorc) {
  const nuorcValidado = validarNuorc(nuorc);
  const registros = await executarConsultaSankhya(sqlDadosSincronizacaoTcbmet(nuorcValidado));
  return registros.map(normalizarItemTcbmet).filter((item) => (
    item.codEmp > 0 &&
    item.codCencus > 0 &&
    item.codCtaCtb > 0 &&
    item.dtRef
  ));
}

function validarItensSincronizacaoTcbmet(itens) {
  if (!itens.length) {
    throw new Error("Não existem lançamentos ativos para sincronizar.");
  }

  const itemSemRecDesp = itens.find((item) => !item.recDesp);
  if (itemSemRecDesp) {
    throw new Error(
      `Não foi possível determinar RECDESP para a conta ${itemSemRecDesp.codCtaCtb}. Verifique o cadastro contábil antes de sincronizar.`
    );
  }
}

export async function obterPreviewSincronizacaoTcbmet(nuorc) {
  const nuorcValidado = validarNuorc(nuorc);
  await validarUsuarioAdminOrcamento("Apenas administradores podem sincronizar com a TCBMET.");

  const status = await obterStatusOrcamento(nuorcValidado);
  if (status !== "O") {
    throw new Error("Somente orçamentos oficiais podem ser sincronizados com a TCBMET.");
  }

  const itens = await listarItensSincronizacaoTcbmet(nuorcValidado);
  validarItensSincronizacaoTcbmet(itens);

  return {
    nuorc: nuorcValidado,
    qtdLancamentos: itens.reduce((total, item) => total + item.qtdLanc, 0),
    qtdCombinacoes: itens.length,
    valorTotal: itens.reduce((total, item) => total + item.previsto, 0)
  };
}

async function buscarCodCcoTcbmet(item) {
  const [registro] = await executarConsultaSankhya(sqlBuscarTcbmetExistente(item));
  return numero(valorCampo(registro, "CODCCO"));
}

async function salvarItemTcbmet(item) {
  const codCcoExistente = await buscarCodCcoTcbmet(item);
  const dados = {
    CODCCO: codCcoExistente || await obterProximoCodCcoTcbmet(),
    PREVISTO: item.previsto,
    DHALTER: formatarDataHoraSankhya()
  };

  if (!codCcoExistente) {
    dados.CODEMP = item.codEmp;
    dados.CODCTACTB = item.codCtaCtb;
    if (item.codProj > 0) dados.CODPROJ = item.codProj;
    // TODO: preencher NUPERIODOCTB quando a regra obrigatória do ambiente for confirmada.
    dados.CODCENCUS = item.codCencus;
    dados.DTREF = item.dtRef;
    dados.REALIZADO = 0;
    dados.RECDESP = item.recDesp;
  }

  await executarCrudSaveSankhya(dados, "TCBMET");
  return codCcoExistente ? "atualizado" : "inserido";
}

export async function sincronizarTcbmetOrcamento(nuorc) {
  const nuorcValidado = validarNuorc(nuorc);
  await validarUsuarioAdminOrcamento("Apenas administradores podem sincronizar com a TCBMET.");

  const status = await obterStatusOrcamento(nuorcValidado);
  if (status !== "O") {
    throw new Error("Somente orçamentos oficiais podem ser sincronizados com a TCBMET.");
  }

  const itens = await listarItensSincronizacaoTcbmet(nuorcValidado);
  validarItensSincronizacaoTcbmet(itens);

  let inseridos = 0;
  let atualizados = 0;

  for (const item of itens) {
    const resultado = await salvarItemTcbmet(item);
    if (resultado === "inserido") inseridos += 1;
    if (resultado === "atualizado") atualizados += 1;
  }

  return {
    nuorc: nuorcValidado,
    qtdLancamentos: itens.reduce((total, item) => total + item.qtdLanc, 0),
    qtdCombinacoes: itens.length,
    valorTotal: itens.reduce((total, item) => total + item.previsto, 0),
    inseridos,
    atualizados
  };
}

export async function obterStatusOrcamento(nuorc) {
  const nuorcValidado = validarNuorc(nuorc);
  const [registro] = await executarConsultaSankhya(sqlStatusOrcamento(nuorcValidado));
  return texto(valorCampo(registro, "STATUS"));
}

export async function alterarStatusOrcamento(nuorc, novoStatus) {
  const nuorcValidado = validarNuorc(nuorc);
  const status = texto(novoStatus).trim().toUpperCase();

  if (!["E", "O"].includes(status)) {
    throw new Error("Status de orçamento inválido.");
  }

  const statusAtual = await obterStatusOrcamento(nuorcValidado);

  if (!statusAtual) {
    throw new Error("Orçamento não encontrado para alteração de status.");
  }

  await validarUsuarioAdminOrcamento(
    statusAtual === "O" && status === "E"
      ? "Apenas administradores podem reabrir orçamento oficial."
      : "Você não possui permissão para executar esta ação."
  );

  if (statusAtual === status) {
    return { nuorc: nuorcValidado, status };
  }

  const codigoUsuario = await obterCodigoUsuarioAtual();

  await executarCrudSaveSankhya({
    NUORC: nuorcValidado,
    STATUS: status,
    CODUSUALT: codigoUsuario,
    DHALT: formatarDataHoraSankhya()
  }, "AD_ORCAMENTO");

  return { nuorc: nuorcValidado, status };
}

export async function existeLancamentoDuplicado(dadosLancamento) {
  const parametros = {
    nuorc: validarNuorc(dadosLancamento.nuorc),
    idOrcEmp: validarInteiroPositivo(dadosLancamento.idOrcEmp, "Informe o IDORCEMP."),
    idOrcCus: validarInteiroPositivo(dadosLancamento.idOrcCus, "Informe o ID do centro de resultado."),
    idOrcCta: validarInteiroPositivo(dadosLancamento.idOrcCta, "Informe o IDORCCTA."),
    mes: validarMes(dadosLancamento.mes),
    idOrcLancIgnorado: dadosLancamento.idOrcLancIgnorado
      ? validarInteiroPositivo(dadosLancamento.idOrcLancIgnorado, "Lançamento inválido para validação de duplicidade.")
      : null
  };
  const [registro] = await executarConsultaSankhya(sqlContarLancamentoDuplicado(parametros));
  return numero(valorCampo(registro, "QTD")) > 0;
}

async function existeRegistro(sql) {
  const [registro] = await executarConsultaSankhya(sql);
  return numero(valorCampo(registro, "QTD")) > 0;
}

async function validarCadastrosLancamento({ idOrcEmp, idOrcCus, idOrcCta }) {
  if (!(await existeRegistro(sqlExisteOrcEmp(idOrcEmp)))) {
    throw new Error(`Empresa do orçamento não encontrada na AD_ORCEMP para IDORCEMP ${idOrcEmp}.`);
  }

  if (!(await existeRegistro(sqlExisteOrcCus(idOrcCus)))) {
    throw new Error(`Centro de resultado não encontrado na AD_ORCCUS para ID ${idOrcCus}.`);
  }

  if (!(await existeRegistro(sqlExisteOrcCta(idOrcCta)))) {
    throw new Error(`Conta contábil não encontrada na AD_ORCCTA para IDORCCTA ${idOrcCta}.`);
  }
}

async function validarOrcamentoPermiteAlterarLancamentos(nuorc) {
  const status = await obterStatusOrcamento(nuorc);

  if (status === "O") {
    throw new Error("Orçamento oficial. Não é permitido alterar lançamentos.");
  }

  if (status !== "E") {
    throw new Error("Somente orçamentos em elaboração permitem alterar lançamentos.");
  }
}

async function obterCentroLancamento(idOrcLanc, nuorc) {
  const [registro] = await executarConsultaSankhya(sqlCentroLancamento(idOrcLanc, nuorc));
  return numero(valorCampo(registro, "IDORCCUS"));
}

export async function criarLancamentoOrcamentario(dadosLancamento) {
  const nuorc = validarNuorc(dadosLancamento.nuorc);
  const idOrcEmp = validarInteiroPositivo(dadosLancamento.idOrcEmp, "Informe o IDORCEMP.");
  const idOrcCus = validarInteiroPositivo(dadosLancamento.idOrcCus, "Informe o ID do centro de resultado.");
  const idOrcCta = validarInteiroPositivo(dadosLancamento.idOrcCta, "Informe o IDORCCTA.");
  const mes = validarMes(dadosLancamento.mes);
  const vlrOrcado = validarValorOrcado(dadosLancamento.vlrOrcado);
  const descrLanc = texto(dadosLancamento.descrLanc).trim();
  const observacao = texto(dadosLancamento.observacao).trim();
  const origem = texto(dadosLancamento.origem || "M").trim() || "M";
  const status = await obterStatusOrcamento(nuorc);

  if (status === "O") {
    throw new Error("Orçamento oficial. Não é permitido lançar.");
  }

  if (status !== "E") {
    throw new Error("Somente orçamentos em elaboração permitem lançamento.");
  }

  await validarRlsCentroLancamento(
    idOrcCus,
    "Você não possui permissão para lançar neste centro de resultado.",
    "Diretoria possui visão geral, mas só pode lançar nos centros vinculados ao usuário."
  );
  await validarCadastrosLancamento({ idOrcEmp, idOrcCus, idOrcCta });

  if (await existeLancamentoDuplicado({ nuorc, idOrcEmp, idOrcCus, idOrcCta, mes })) {
    throw new Error("Já existe lançamento para esta empresa, centro de resultado, conta e mês neste orçamento.");
  }

  const idOrcLanc = await obterProximoIdOrcLanc();
  const codigoUsuario = await obterCodigoUsuarioAtual();
  const dados = {
    IDORCLANC: idOrcLanc,
    NUORC: nuorc,
    IDORCEMP: idOrcEmp,
    IDORCCUS: idOrcCus,
    IDORCCTA: idOrcCta,
    MES: mes,
    VLRORCADO: vlrOrcado,
    ORIGEM: origem,
    ATIVA: "S",
    CODUSUINC: codigoUsuario,
    DHINC: formatarDataHoraSankhya()
  };

  if (descrLanc) dados.DESCRLANC = descrLanc;
  if (observacao) dados.OBSERVACAO = observacao;

  await executarCrudSaveSankhya(dados, "AD_ORCLANC");

  return { idOrcLanc, nuorc };
}

export async function editarLancamentoOrcamentario(dadosLancamento) {
  const idOrcLanc = validarInteiroPositivo(dadosLancamento.idOrcLanc, "Informe o IDORCLANC.");
  const nuorc = validarNuorc(dadosLancamento.nuorc);
  const idOrcEmp = validarInteiroPositivo(dadosLancamento.idOrcEmp, "Informe o IDORCEMP.");
  const idOrcCus = validarInteiroPositivo(dadosLancamento.idOrcCus, "Informe o IDORCCUS.");
  const idOrcCta = validarInteiroPositivo(dadosLancamento.idOrcCta, "Informe o IDORCCTA.");
  const mes = validarMes(dadosLancamento.mes);
  const vlrOrcado = validarValorOrcado(dadosLancamento.vlrOrcado);
  const descrLanc = texto(dadosLancamento.descrLanc).trim();
  const observacao = texto(dadosLancamento.observacao).trim();
  const origem = texto(dadosLancamento.origem || "M").trim() || "M";

  await validarOrcamentoPermiteAlterarLancamentos(nuorc);
  const centroAtual = await obterCentroLancamento(idOrcLanc, nuorc);

  await validarRlsCentroLancamento(
    centroAtual,
    "Você não possui permissão para alterar lançamento deste centro de resultado.",
    "Diretoria possui visão geral, mas só pode alterar lançamentos dos centros vinculados ao usuário."
  );
  await validarRlsCentroLancamento(
    idOrcCus,
    "Você não possui permissão para alterar lançamento deste centro de resultado.",
    "Diretoria possui visão geral, mas só pode alterar lançamentos dos centros vinculados ao usuário."
  );
  await validarCadastrosLancamento({ idOrcEmp, idOrcCus, idOrcCta });

  if (await existeLancamentoDuplicado({
    nuorc,
    idOrcEmp,
    idOrcCus,
    idOrcCta,
    mes,
    idOrcLancIgnorado: idOrcLanc
  })) {
    throw new Error("Já existe outro lançamento para esta empresa, centro de resultado, conta e mês neste orçamento.");
  }

  const codigoUsuario = await obterCodigoUsuarioAtual();
  const dados = {
    IDORCLANC: idOrcLanc,
    NUORC: nuorc,
    IDORCEMP: idOrcEmp,
    IDORCCUS: idOrcCus,
    IDORCCTA: idOrcCta,
    MES: mes,
    VLRORCADO: vlrOrcado,
    DESCRLANC: descrLanc,
    OBSERVACAO: observacao,
    ORIGEM: origem,
    CODUSUALT: codigoUsuario,
    DHALT: formatarDataHoraSankhya()
  };

  await executarCrudSaveSankhya(dados, "AD_ORCLANC");

  return { idOrcLanc, nuorc };
}

export async function inativarLancamentoOrcamentario({ idOrcLanc, nuorc }) {
  const idOrcLancValidado = validarInteiroPositivo(idOrcLanc, "Informe o IDORCLANC.");
  const nuorcValidado = validarNuorc(nuorc);

  await validarOrcamentoPermiteAlterarLancamentos(nuorcValidado);
  const centroAtual = await obterCentroLancamento(idOrcLancValidado, nuorcValidado);

  await validarRlsCentroLancamento(
    centroAtual,
    "Você não possui permissão para inativar lançamento deste centro de resultado.",
    "Diretoria possui visão geral, mas só pode inativar lançamentos dos centros vinculados ao usuário."
  );

  const codigoUsuario = await obterCodigoUsuarioAtual();

  await executarCrudSaveSankhya({
    IDORCLANC: idOrcLancValidado,
    NUORC: nuorcValidado,
    ATIVA: "N",
    CODUSUALT: codigoUsuario,
    DHALT: formatarDataHoraSankhya()
  }, "AD_ORCLANC");

  return { idOrcLanc: idOrcLancValidado, nuorc: nuorcValidado };
}

