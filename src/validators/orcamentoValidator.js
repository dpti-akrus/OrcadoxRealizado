import { STATUS_ORCAMENTO } from "../constants/database.js";
import { converterValorDecimal, somarValores } from "../helpers/numberHelpers.js";

export function validarOrcamento(dados) {
  const erros = {};
  const camposObrigatorios = ["EXERCICIO", "VERSAO", "CODEMP", "CODCENCUS", "CODCTACTB"];

  camposObrigatorios.forEach((campo) => {
    if (dados[campo] === undefined || dados[campo] === null || dados[campo] === "") {
      erros[campo] = "Campo obrigatório.";
    }
  });

  if (!Number.isInteger(Number(dados.EXERCICIO)) || Number(dados.EXERCICIO) < 2000) {
    erros.EXERCICIO = "Informe um exercício válido.";
  }
  if (!Number.isInteger(Number(dados.VERSAO)) || Number(dados.VERSAO) < 1) {
    erros.VERSAO = "A versão deve ser um inteiro maior que zero.";
  }
  if (dados.STATUS && !STATUS_ORCAMENTO.includes(dados.STATUS)) {
    erros.STATUS = `Status inválido. Use: ${STATUS_ORCAMENTO.join(", ")}.`;
  }
  if (!Array.isArray(dados.meses) || dados.meses.length !== 12) {
    erros.meses = "O orçamento deve possuir exatamente 12 meses.";
  } else {
    const meses = dados.meses.map((item) => Number(item.MES));
    if (new Set(meses).size !== 12 || meses.some((mes) => mes < 1 || mes > 12)) {
      erros.meses = "Informe uma única linha para cada mês de 1 a 12.";
    }

    const totalMensal = somarValores(dados.meses.map((item) => item.VLRORCADO));
    if (Math.abs(totalMensal - converterValorDecimal(dados.VLRORCADO)) >= 0.01) {
      erros.VLRORCADO = "O total anual deve ser igual à soma dos 12 meses.";
    }
  }

  return { valido: Object.keys(erros).length === 0, erros };
}

export function garantirOrcamentoValido(dados) {
  const resultado = validarOrcamento(dados);
  if (!resultado.valido) {
    const erro = new Error("Dados do orçamento inválidos.");
    erro.detalhes = resultado.erros;
    throw erro;
  }
  return dados;
}

