import { executarConsultaSankhya } from "./sankhya/nativeSqlService.js";

function validarCodusu(codusu) {
  const valor = Number(codusu);
  if (!Number.isInteger(valor) || valor <= 0) {
    return 0;
  }
  return valor;
}

function valorCampo(registro, campo) {
  if (!registro) return null;
  const chave = Object.keys(registro).find((item) => item.toUpperCase() === campo);
  return chave ? registro[chave] : null;
}

function sqlPerfilUsuarioOrcamento(codusu) {
  return `
SELECT
  CODUSU,
  TIPOUSU
FROM AD_ORCUSU
WHERE CODUSU = ${codusu}
  AND NVL(ATIVO, 'S') = 'S'
`;
}

function sqlValidarAdminOrcamento(codusu) {
  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCUSU
WHERE CODUSU = ${codusu}
  AND TIPOUSU = 'A'
  AND NVL(ATIVO, 'S') = 'S'
`;
}

function sqlCentrosPermitidosUsuario(codusu) {
  return `
SELECT DISTINCT
  C.ID AS IDORCCUS,
  C.NOME AS DESCRCENCUS
FROM AD_ORCUSU U
INNER JOIN AD_ORCCUS C
  ON C.ID = U.IDORCCUS
WHERE U.CODUSU = ${codusu}
  AND NVL(U.ATIVO, 'S') = 'S'
  AND NVL(C.ATIVO, 'S') = 'S'
UNION
SELECT DISTINCT
  C.ID AS IDORCCUS,
  C.NOME AS DESCRCENCUS
FROM AD_ORCUSU U
INNER JOIN AD_ORCUSUCUS UC
  ON UC.IDORCUSU = U.IDORCUSU
INNER JOIN AD_ORCCUS C
  ON C.ID = UC.IDORCCUS
WHERE U.CODUSU = ${codusu}
  AND NVL(U.ATIVO, 'S') = 'S'
  AND NVL(UC.ATIVO, 'S') = 'S'
  AND NVL(C.ATIVO, 'S') = 'S'
ORDER BY IDORCCUS
`;
}

function sqlUsuarioPodeAcessarCentro(codusu, idOrcCus) {
  return `
SELECT COUNT(1) AS QTD
FROM AD_ORCUSU U
WHERE U.CODUSU = ${codusu}
  AND NVL(U.ATIVO, 'S') = 'S'
  AND (
    U.IDORCCUS = ${idOrcCus}
    OR EXISTS (
      SELECT 1
      FROM AD_ORCUSUCUS UC
      WHERE UC.IDORCUSU = U.IDORCUSU
        AND UC.IDORCCUS = ${idOrcCus}
        AND NVL(UC.ATIVO, 'S') = 'S'
    )
  )
`;
}

function numero(valor, fallback = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : fallback;
}

export function getPerfilUsuarioOrcamento(tipo) {
  const perfil = String(tipo || "G").trim().toUpperCase();
  return ["G", "D", "A"].includes(perfil) ? perfil : "G";
}

export function isAdminOrcamento(perfil) {
  return getPerfilUsuarioOrcamento(perfil?.tipo || perfil) === "A";
}

export function isDiretoriaOrcamento(perfil) {
  return getPerfilUsuarioOrcamento(perfil?.tipo || perfil) === "D";
}

export function isGestorOrcamento(perfil) {
  return getPerfilUsuarioOrcamento(perfil?.tipo || perfil) === "G";
}

export function descreverPerfilUsuarioOrcamento(tipo) {
  const perfil = getPerfilUsuarioOrcamento(tipo);
  if (perfil === "A") return "Administrador";
  if (perfil === "D") return "Diretoria";
  return "Gestor";
}

export async function buscarPerfilUsuarioOrcamento(codusu) {
  const codusuValidado = validarCodusu(codusu);

  if (!codusuValidado) {
    return {
      codusu: 0,
      tipo: "G",
      descricao: "Gestor",
      admin: false
    };
  }

  const [registro] = await executarConsultaSankhya(sqlPerfilUsuarioOrcamento(codusuValidado));
  const tipo = getPerfilUsuarioOrcamento(valorCampo(registro, "TIPOUSU"));
  const admin = tipo === "A";

  return {
    codusu: codusuValidado,
    tipo,
    descricao: descreverPerfilUsuarioOrcamento(tipo),
    admin
  };
}

export async function validarAdministradorOrcamento(codusu) {
  const codusuValidado = validarCodusu(codusu);

  if (!codusuValidado) return false;

  const [registro] = await executarConsultaSankhya(sqlValidarAdminOrcamento(codusuValidado));
  return Number(valorCampo(registro, "QTD") || 0) > 0;
}

export async function buscarCentrosPermitidosUsuario(codusu) {
  const codusuValidado = validarCodusu(codusu);

  if (!codusuValidado) return [];

  const registros = await executarConsultaSankhya(sqlCentrosPermitidosUsuario(codusuValidado));
  return registros
    .map((registro) => ({
      idOrcCus: numero(valorCampo(registro, "IDORCCUS")),
      codCencus: numero(valorCampo(registro, "IDORCCUS")),
      descricao: String(valorCampo(registro, "DESCRCENCUS") || "")
    }))
    .filter((centro) => centro.idOrcCus > 0);
}

export async function usuarioPodeAcessarCentro(codusu, idOrcCus) {
  const codusuValidado = validarCodusu(codusu);
  const idValidado = numero(idOrcCus);

  if (!codusuValidado || !idValidado) return false;

  const [registro] = await executarConsultaSankhya(sqlUsuarioPodeAcessarCentro(codusuValidado, idValidado));
  return numero(valorCampo(registro, "QTD")) > 0;
}
