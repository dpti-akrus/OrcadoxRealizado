import { TABELAS } from "../constants/database.js";
import {
  executarCrudFindSankhya,
  executarCrudSaveSankhya,
  obterValorCampoCrud
} from "./sankhya/nativeSqlService.js";

const TIPOS_USUARIO_VALIDOS = ["N", "A", "D"];

function campoTexto(registro, campo, padrao = "") {
  return String(obterValorCampoCrud(registro, campo) || padrao);
}

function campoNumero(registro, campo) {
  const valor = Number(obterValorCampoCrud(registro, campo));
  return Number.isFinite(valor) ? valor : null;
}

export async function buscarUsuarioSistemaPorCodigo(codigoUsuario) {
  const codigo = Number(codigoUsuario);
  if (!Number.isInteger(codigo) || codigo <= 0) {
    throw new Error("Código de usuário inválido.");
  }

  const registros = await executarCrudFindSankhya(
    TABELAS.USUARIO,
    ["CODUSU", "NOMEUSUCPLT", "NOMEUSU"],
    `CODUSU = ${codigo}`
  );

  const usuario = registros[0];
  if (!usuario) return null;

  return {
    codigo: campoNumero(usuario, "CODUSU"),
    nome: campoTexto(usuario, "NOMEUSUCPLT") || campoTexto(usuario, "NOMEUSU")
  };
}

export async function buscarUsuarios(filtros = {}) {
  const condicoes = [];

  if (filtros.codigoUsuario !== undefined && filtros.codigoUsuario !== null && filtros.codigoUsuario !== "") {
    const codigo = Number(filtros.codigoUsuario);
    if (!Number.isInteger(codigo)) throw new Error("Código de usuário inválido.");
    condicoes.push(`CODUSU = ${codigo}`);
  }

  if (filtros.ativo) {
    condicoes.push(`ATIVO = '${filtros.ativo === "S" ? "S" : "N"}'`);
  }

  const registros = await executarCrudFindSankhya(
    TABELAS.ORC_USUARIO,
    ["IDORCUSU", "CODUSU", "NOMEAPP", "CARGO", "TIPOUSU", "ATIVO"],
    condicoes.join(" AND ")
  );

  const dados = registros
    .map((registro) => ({
      IDORCUSU: campoNumero(registro, "IDORCUSU"),
      CODUSU: campoNumero(registro, "CODUSU"),
      NOMEAPP: campoTexto(registro, "NOMEAPP"),
      CARGO: campoTexto(registro, "CARGO"),
      TIPOUSU: campoTexto(registro, "TIPOUSU"),
      ATIVO: campoTexto(registro, "ATIVO", "S")
    }))
    .sort((a, b) => a.NOMEAPP.localeCompare(b.NOMEAPP, "pt-BR"));

  return { dados, total: dados.length };
}

export async function salvarUsuario(dados) {
  const codigoUsuario = Number(dados.CODUSU);

  if (
    !Number.isInteger(codigoUsuario) ||
    codigoUsuario <= 0 ||
    !dados.NOMEAPP?.trim() ||
    !TIPOS_USUARIO_VALIDOS.includes(dados.TIPOUSU)
  ) {
    throw new Error("Usuário, nome e tipo de usuário válido são obrigatórios.");
  }

  const usuarioSistema = await buscarUsuarioSistemaPorCodigo(codigoUsuario);
  if (!usuarioSistema) {
    throw new Error("O código informado não existe na TSIUSU.");
  }

  const consulta = await buscarUsuarios({ codigoUsuario });
  const existente = consulta.dados[0];

  if (existente && Number(dados.IDORCUSU) !== Number(existente.IDORCUSU)) {
    throw new Error("Este usuário já está cadastrado na AD_ORCUSU.");
  }

  const dadosUsuario = {
    CODUSU: codigoUsuario,
    NOMEAPP: dados.NOMEAPP.trim(),
    CARGO: String(dados.CARGO || "").trim(),
    TIPOUSU: dados.TIPOUSU,
    ATIVO: dados.ATIVO ?? "S"
  };

  await executarCrudSaveSankhya(
    existente ? { IDORCUSU: existente.IDORCUSU, ...dadosUsuario } : dadosUsuario,
    TABELAS.ORC_USUARIO
  );

  return buscarUsuarios({ codigoUsuario });
}

export async function alterarStatusUsuario(idUsuario, ativo) {
  const id = Number(idUsuario);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID do usuário inválido.");
  }

  return executarCrudSaveSankhya(
    { IDORCUSU: id, ATIVO: ativo ? "S" : "N" },
    TABELAS.ORC_USUARIO
  );
}
