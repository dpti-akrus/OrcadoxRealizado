import { obterSessaoAtual } from "./sankhya/sessionService.js";
import { executarCrudSaveSankhya, executarConsultaSankhya } from "./sankhya/nativeSqlService.js";
import { validarAdministradorOrcamento } from "./perfilUsuarioService.js";

function valorCampo(registro, campo) {
  if (!registro) return null;
  const chave = Object.keys(registro).find((item) => item.toUpperCase() === campo);
  return chave ? registro[chave] : null;
}

function numero(valor, fallback = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : fallback;
}

function texto(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function doisDigitos(valor) {
  return String(valor).padStart(2, "0");
}

function formatarDataHoraSankhya(data = new Date()) {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()} ${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}`;
}

async function obterCodigoUsuarioAtual() {
  const sessao = await obterSessaoAtual();
  const codigoUsuario = Number(sessao?.codigoUsuario);
  return Number.isInteger(codigoUsuario) && codigoUsuario > 0 ? codigoUsuario : 0;
}

async function validarAdmin() {
  const codigoUsuario = await obterCodigoUsuarioAtual();
  if (!(await validarAdministradorOrcamento(codigoUsuario))) {
    throw new Error("Você não possui permissão para executar esta ação.");
  }
  return codigoUsuario;
}

async function proximoId(tabela, campo) {
  // TODO: substituir MAX(ID)+1 por sequence/trigger ou rotina transacional segura no banco.
  const [registro] = await executarConsultaSankhya(`
SELECT NVL(MAX(${campo}), 0) + 1 AS PROXIMO
FROM ${tabela}
`);
  return numero(valorCampo(registro, "PROXIMO"), 1);
}

async function contar(sql) {
  const [registro] = await executarConsultaSankhya(sql);
  return numero(valorCampo(registro, "QTD"));
}

function exigirInteiro(valor, mensagem) {
  const convertido = Number(valor);
  if (!Number.isInteger(convertido) || convertido <= 0) throw new Error(mensagem);
  return convertido;
}

function exigirTexto(valor, mensagem) {
  const convertido = texto(valor).trim();
  if (!convertido) throw new Error(mensagem);
  return convertido;
}

export async function listarGruposEmpresa() {
  const registros = await executarConsultaSankhya(`
SELECT
  IDGRUPEMP AS IDORCGRUPEMP,
  NOMEGRUPO AS GRUPO_EMPRESA
FROM AD_ORCGRUEMP
WHERE NVL(ATIVO, 'S') = 'S'
ORDER BY NOMEGRUPO
`);
  return registros.map((registro) => ({
    idOrcGruEmp: numero(valorCampo(registro, "IDORCGRUPEMP")),
    grupoEmpresa: texto(valorCampo(registro, "GRUPO_EMPRESA"))
  })).filter((item) => item.idOrcGruEmp > 0);
}

export async function listarEmpresasAdmin() {
  const registros = await executarConsultaSankhya(`
SELECT
  E.IDORCEMP,
  E.CODEMP,
  E.NOME AS NOMEFANTASIA,
  NVL(E.ATIVO, 'S') AS ATIVA,
  E.IDGRUPEMP AS IDORCGRUPEMP,
  G.NOMEGRUPO AS GRUPO_EMPRESA,
  E.CODUSUINC,
  E.DHINC,
  E.CODUSUALT,
  E.DHALT
FROM AD_ORCEMP E
LEFT JOIN AD_ORCGRUEMP G
  ON G.IDGRUPEMP = E.IDGRUPEMP
WHERE NVL(E.ATIVO, 'S') = 'S'
ORDER BY E.CODEMP
`);
  return registros.map((registro) => ({
    id: numero(valorCampo(registro, "IDORCEMP")),
    codigo: numero(valorCampo(registro, "CODEMP")),
    nome: texto(valorCampo(registro, "NOMEFANTASIA")),
    grupoId: numero(valorCampo(registro, "IDORCGRUPEMP")),
    grupo: texto(valorCampo(registro, "GRUPO_EMPRESA")),
    ativo: texto(valorCampo(registro, "ATIVA")) || "S"
  })).filter((item) => item.id > 0);
}

export async function salvarEmpresaAdmin(dados) {
  const codigoUsuario = await validarAdmin();
  const id = numero(dados.id);
  const codEmp = exigirInteiro(dados.codigo, "Informe o código da empresa.");
  const nome = exigirTexto(dados.nome, "Informe o nome da empresa.");
  const grupoId = numero(dados.grupoId);

  const duplicados = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCEMP
WHERE CODEMP = ${codEmp}
  AND NVL(ATIVO, 'S') = 'S'
  AND IDORCEMP <> ${id || -1}
`);
  if (duplicados > 0) throw new Error("Já existe empresa ativa cadastrada para este CODEMP.");

  const idFinal = id || await proximoId("AD_ORCEMP", "IDORCEMP");
  const payload = {
    IDORCEMP: idFinal,
    CODEMP: codEmp,
    NOME: nome,
    ATIVO: "S"
  };
  if (grupoId > 0) payload.IDGRUPEMP = grupoId;
  if (id) {
    payload.CODUSUALT = codigoUsuario;
    payload.DHALT = formatarDataHoraSankhya();
  } else {
    payload.CODUSUINC = codigoUsuario;
    payload.DHINC = formatarDataHoraSankhya();
  }

  await executarCrudSaveSankhya(payload, "AD_ORCEMP");
  return { id: idFinal };
}

export async function inativarEmpresaAdmin(id) {
  const codigoUsuario = await validarAdmin();
  const idValidado = exigirInteiro(id, "Empresa inválida para inativação.");
  const vinculados = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCLANC
WHERE IDORCEMP = ${idValidado}
  AND NVL(ATIVA, 'S') = 'S'
`);
  if (vinculados > 0) {
    throw new Error("Não é possível inativar. Existem lançamentos ativos vinculados a esta empresa.");
  }
  await executarCrudSaveSankhya({
    IDORCEMP: idValidado,
    ATIVO: "N",
    CODUSUALT: codigoUsuario,
    DHALT: formatarDataHoraSankhya()
  }, "AD_ORCEMP");
}

export async function listarCentrosAdmin() {
  const registros = await executarConsultaSankhya(`
SELECT
  ID AS IDORCCUS,
  CODCENCUS,
  NOME AS DESCRCENCUS,
  NVL(ATIVO, 'S') AS ATIVA,
  CODUSUINC,
  DHINC,
  CODUSUALT,
  DHALT
FROM AD_ORCCUS
WHERE NVL(ATIVO, 'S') = 'S'
ORDER BY CODCENCUS
`);
  return registros.map((registro) => ({
    id: numero(valorCampo(registro, "IDORCCUS")),
    codigo: numero(valorCampo(registro, "CODCENCUS")),
    nome: texto(valorCampo(registro, "DESCRCENCUS")),
    ativo: texto(valorCampo(registro, "ATIVA")) || "S"
  })).filter((item) => item.id > 0);
}

export async function salvarCentroAdmin(dados) {
  const codigoUsuario = await validarAdmin();
  const id = numero(dados.id);
  const codCencus = exigirInteiro(dados.codigo, "Informe o código do centro de resultado.");
  const nome = exigirTexto(dados.nome, "Informe a descrição do centro de resultado.");

  const duplicados = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCCUS
WHERE CODCENCUS = ${codCencus}
  AND NVL(ATIVO, 'S') = 'S'
  AND ID <> ${id || -1}
`);
  if (duplicados > 0) throw new Error("Já existe centro de resultado ativo para este CODCENCUS.");

  const idFinal = id || await proximoId("AD_ORCCUS", "ID");
  const payload = {
    ID: idFinal,
    CODCENCUS: codCencus,
    NOME: nome,
    ATIVO: "S"
  };
  if (id) {
    payload.CODUSUALT = codigoUsuario;
    payload.DHALT = formatarDataHoraSankhya();
  } else {
    payload.CODUSUINC = codigoUsuario;
    payload.DHINC = formatarDataHoraSankhya();
  }

  await executarCrudSaveSankhya(payload, "AD_ORCCUS");
  return { id: idFinal };
}

export async function inativarCentroAdmin(id) {
  const codigoUsuario = await validarAdmin();
  const idValidado = exigirInteiro(id, "Centro de resultado inválido para inativação.");
  const lancamentos = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCLANC
WHERE IDORCCUS = ${idValidado}
  AND NVL(ATIVA, 'S') = 'S'
`);
  if (lancamentos > 0) {
    throw new Error("Não é possível inativar. Existem lançamentos ativos vinculados a este centro de resultado.");
  }
  const usuarios = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCUSUCUS
WHERE IDORCCUS = ${idValidado}
  AND NVL(ATIVO, 'S') = 'S'
`);
  if (usuarios > 0) {
    throw new Error("Não é possível inativar. Existem usuários vinculados a este centro de resultado.");
  }
  await executarCrudSaveSankhya({
    ID: idValidado,
    ATIVO: "N",
    CODUSUALT: codigoUsuario,
    DHALT: formatarDataHoraSankhya()
  }, "AD_ORCCUS");
}

export async function listarContasAdmin() {
  const registros = await executarConsultaSankhya(`
SELECT
  IDORCCTA,
  CODCTACTB,
  NVL(NOME, DESCRICAO) AS DESCRCTA,
  NVL(ATIVA, 'S') AS ATIVA,
  CODUSUINC,
  DHINC,
  CODUSUALT,
  DHALT
FROM AD_ORCCTA
WHERE NVL(ATIVA, 'S') = 'S'
ORDER BY CODCTACTB
`);
  return registros.map((registro) => ({
    id: numero(valorCampo(registro, "IDORCCTA")),
    codigo: numero(valorCampo(registro, "CODCTACTB")),
    nome: texto(valorCampo(registro, "DESCRCTA")),
    ativo: texto(valorCampo(registro, "ATIVA")) || "S"
  })).filter((item) => item.id > 0);
}

export async function salvarContaAdmin(dados) {
  const codigoUsuario = await validarAdmin();
  const id = numero(dados.id);
  const codCtaCtb = exigirInteiro(dados.codigo, "Informe o código da conta contábil.");
  const nome = exigirTexto(dados.nome, "Informe a descrição da conta contábil.");

  const duplicados = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCCTA
WHERE CODCTACTB = ${codCtaCtb}
  AND NVL(ATIVA, 'S') = 'S'
  AND IDORCCTA <> ${id || -1}
`);
  if (duplicados > 0) throw new Error("Já existe conta contábil ativa para este CODCTACTB.");

  const idFinal = id || await proximoId("AD_ORCCTA", "IDORCCTA");
  const payload = {
    IDORCCTA: idFinal,
    CODCTACTB: codCtaCtb,
    NOME: nome,
    DESCRICAO: nome,
    ATIVA: "S"
  };
  if (id) {
    payload.CODUSUALT = codigoUsuario;
    payload.DHALT = formatarDataHoraSankhya();
  } else {
    payload.CODUSUINC = codigoUsuario;
    payload.DHINC = formatarDataHoraSankhya();
  }

  await executarCrudSaveSankhya(payload, "AD_ORCCTA");
  return { id: idFinal };
}

export async function inativarContaAdmin(id) {
  const codigoUsuario = await validarAdmin();
  const idValidado = exigirInteiro(id, "Conta contábil inválida para inativação.");
  const lancamentos = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCLANC
WHERE IDORCCTA = ${idValidado}
  AND NVL(ATIVA, 'S') = 'S'
`);
  if (lancamentos > 0) {
    throw new Error("Não é possível inativar. Existem lançamentos ativos vinculados a esta conta contábil.");
  }
  await executarCrudSaveSankhya({
    IDORCCTA: idValidado,
    ATIVA: "N",
    CODUSUALT: codigoUsuario,
    DHALT: formatarDataHoraSankhya()
  }, "AD_ORCCTA");
}

export async function listarUsuariosAdmin() {
  const registros = await executarConsultaSankhya(`
SELECT
  U.IDORCUSU,
  U.CODUSU,
  NVL(U.NOMEAPP, USU.NOMEUSU) AS NOMEAPP,
  U.CARGO,
  U.IDORCCUS,
  C.NOME AS CENTRO_RESULTADO,
  U.TIPOUSU,
  CASE
    WHEN U.TIPOUSU = 'G' THEN 'Gestor'
    WHEN U.TIPOUSU = 'D' THEN 'Diretoria'
    WHEN U.TIPOUSU = 'A' THEN 'Administrador'
    ELSE 'Indefinido'
  END AS TIPOUSUDESC,
  NVL(U.ATIVO, 'S') AS ATIVO
FROM AD_ORCUSU U
LEFT JOIN TSIUSU USU
  ON USU.CODUSU = U.CODUSU
LEFT JOIN AD_ORCCUS C
  ON C.ID = U.IDORCCUS
WHERE NVL(U.ATIVO, 'S') = 'S'
ORDER BY NVL(U.NOMEAPP, USU.NOMEUSU), U.CODUSU
`);
  return registros.map((registro) => ({
    id: numero(valorCampo(registro, "IDORCUSU")),
    codigo: numero(valorCampo(registro, "CODUSU")),
    nome: texto(valorCampo(registro, "NOMEAPP")),
    cargo: texto(valorCampo(registro, "CARGO")),
    idOrcCus: numero(valorCampo(registro, "IDORCCUS")),
    centroResultado: texto(valorCampo(registro, "CENTRO_RESULTADO")),
    tipoUsu: texto(valorCampo(registro, "TIPOUSU")) || "G",
    tipoDesc: texto(valorCampo(registro, "TIPOUSUDESC")) || "Gestor",
    ativo: texto(valorCampo(registro, "ATIVO")) || "S"
  })).filter((item) => item.id > 0);
}

export async function listarVinculosUsuario(idOrcUsu) {
  const idOrcUsuValidado = exigirInteiro(idOrcUsu, "Usuário inválido para consulta de vínculos.");
  const registros = await executarConsultaSankhya(`
SELECT
  UC.IDORCUSUCUS,
  UC.IDORCUSU,
  UC.IDORCCUS,
  C.NOME AS DESCRCENCUS
FROM AD_ORCUSUCUS UC
INNER JOIN AD_ORCCUS C
  ON C.ID = UC.IDORCCUS
WHERE UC.IDORCUSU = ${idOrcUsuValidado}
  AND NVL(UC.ATIVO, 'S') = 'S'
ORDER BY C.ID
`);
  return registros.map((registro) => ({
    idVinculo: numero(valorCampo(registro, "IDORCUSUCUS")),
    idOrcUsu: numero(valorCampo(registro, "IDORCUSU")),
    idOrcCus: numero(valorCampo(registro, "IDORCCUS")),
    codCencus: numero(valorCampo(registro, "IDORCCUS")),
    descricao: texto(valorCampo(registro, "DESCRCENCUS"))
  })).filter((item) => item.idOrcCus > 0);
}

async function inativarVinculosUsuario(idOrcUsu) {
  const vinculos = await listarVinculosUsuario(idOrcUsu);
  await Promise.all(vinculos.map((vinculo) => executarCrudSaveSankhya({
    IDORCUSUCUS: vinculo.idVinculo,
    IDORCUSU: idOrcUsu,
    IDORCCUS: vinculo.idOrcCus,
    ATIVO: "N"
  }, "AD_ORCUSUCUS")));
}

export async function salvarUsuarioAdmin(dados) {
  await validarAdmin();
  const id = numero(dados.id);
  const codusu = exigirInteiro(dados.codigo, "Informe o código do usuário.");
  const nomeApp = exigirTexto(dados.nome, "Informe o nome no aplicativo.");
  const cargo = texto(dados.cargo).trim();
  const idOrcCus = exigirInteiro(dados.idOrcCus, "Informe o centro de resultado do usuário.");
  const tipoUsu = texto(dados.tipoUsu || "G").trim().toUpperCase();
  if (!["G", "D", "A"].includes(tipoUsu)) throw new Error("Informe um perfil válido para o usuário.");
  const centrosSelecionados = Array.isArray(dados.centros) ? dados.centros.map(Number).filter((item) => item > 0) : [];
  const centros = Array.from(new Set([idOrcCus, ...centrosSelecionados]));
  const duplicados = await contar(`
SELECT COUNT(1) AS QTD
FROM AD_ORCUSU
WHERE CODUSU = ${codusu}
  AND NVL(ATIVO, 'S') = 'S'
  AND IDORCUSU <> ${id || -1}
`);
  if (duplicados > 0) throw new Error("Já existe usuário ativo cadastrado para este CODUSU.");

  const idFinal = id || await proximoId("AD_ORCUSU", "IDORCUSU");
  const payload = {
    IDORCUSU: idFinal,
    CODUSU: codusu,
    NOMEAPP: nomeApp,
    IDORCCUS: idOrcCus,
    TIPOUSU: tipoUsu,
    ATIVO: "S"
  };
  if (cargo) payload.CARGO = cargo;
  await executarCrudSaveSankhya(payload, "AD_ORCUSU");

  await inativarVinculosUsuario(idFinal);
  for (const idOrcCus of centros) {
    const idVinculo = await proximoId("AD_ORCUSUCUS", "IDORCUSUCUS");
    await executarCrudSaveSankhya({
      IDORCUSUCUS: idVinculo,
      IDORCUSU: idFinal,
      IDORCCUS: idOrcCus,
      ATIVO: "S"
    }, "AD_ORCUSUCUS");
  }

  return { id: idFinal };
}

export async function inativarUsuarioAdmin(idOrcUsu) {
  await validarAdmin();
  const idOrcUsuValidado = exigirInteiro(idOrcUsu, "Usuário inválido para inativação.");
  await executarCrudSaveSankhya({
    IDORCUSU: idOrcUsuValidado,
    ATIVO: "N"
  }, "AD_ORCUSU");
}
