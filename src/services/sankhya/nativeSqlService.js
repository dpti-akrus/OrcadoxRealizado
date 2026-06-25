import { removerCamposVazios } from "../../helpers/objectHelpers.js";
import { descreverFormatoResposta, normalizarLinhas } from "./responseMapper.js";

const IDENTIFICADOR_SEGURO = /^[A-Z][A-Z0-9_]*$/;
const EVENTO_SANKHYA_PRONTO = "sankhya-ready";
const TEMPO_ESPERA_SANKHYA_MS = 60000;
const INTERVALO_VERIFICACAO_SANKHYA_MS = 250;
let adaptador = null;
let promessaSankhyaService = null;

function validarIdentificador(valor, tipo) {
  if (!IDENTIFICADOR_SEGURO.test(valor)) throw new Error(`${tipo} invÃ¡lido: ${valor}`);
}

function validarConfiguracao({ tabela, campos = [], filtros = [], periodo, ordenacao = [] }) {
  validarIdentificador(tabela, "Tabela");
  campos.forEach((campo) => validarIdentificador(campo, "Campo"));
  filtros.forEach(({ campo }) => validarIdentificador(campo, "Campo de filtro"));
  ordenacao.forEach(({ campo }) => validarIdentificador(campo, "Campo de ordenaÃ§Ã£o"));
  if (periodo?.campo) validarIdentificador(periodo.campo, "Campo de perÃ­odo");
}

export function configurarAdaptadorDados(novoAdaptador) {
  const metodos = ["buscar", "inserir", "atualizar", "excluir", "transacao"];
  if (!novoAdaptador || metodos.some((metodo) => typeof novoAdaptador[metodo] !== "function")) {
    throw new Error(`Adaptador invÃ¡lido. Implemente: ${metodos.join(", ")}.`);
  }
  adaptador = novoAdaptador;
}

export function obterAdaptadorDados() {
  if (!adaptador) throw new Error("Nenhum adaptador de dados foi configurado.");
  return adaptador;
}

function obterContextoGlobal() {
  if (typeof window !== "undefined") return window;
  return globalThis;
}

function criarServicoPorServiceProxy(serviceProxy) {
  return {
    consultar: (requestBody) => serviceProxy.callService("mge@crud.find", requestBody),
    salvar: (requestBody) => serviceProxy.callService("mge@crud.save", requestBody),
    callService: (serviceName, requestBody) => serviceProxy.callService(serviceName, requestBody)
  };
}

export function obterSankhyaServiceDisponivel() {
  const contexto = obterContextoGlobal();

  if (contexto.SankhyaService?.consultar && contexto.SankhyaService?.salvar) {
    return contexto.SankhyaService;
  }

  if (contexto.ServiceProxy?.callService) {
    return criarServicoPorServiceProxy(contexto.ServiceProxy);
  }

  return null;
}

export function aguardarSankhyaService() {
  const servicoDisponivel = obterSankhyaServiceDisponivel();
  if (servicoDisponivel) return Promise.resolve(servicoDisponivel);

  const contexto = obterContextoGlobal();
  if (!contexto.addEventListener) {
    return Promise.reject(new Error("O ambiente nativo do Sankhya nÃ£o estÃ¡ disponÃ­vel."));
  }

  if (
    typeof contexto.startApplication === "function" &&
    !contexto.__sankhyaBridgeInicializado &&
    !contexto.__sankhyaBridgeBootstrapExecutado
  ) {
    try {
      contexto.startApplication();
    } catch (error) {
      contexto.__sankhyaBridgeBootstrapErro = error;
      console.error("[BOOT] Erro ao chamar startApplication pelo React:", error);
    }
  }

  if (!promessaSankhyaService) {
    promessaSankhyaService = new Promise((resolve, reject) => {
      let resolvido = false;

      const timeout = contexto.setTimeout(() => {
        const servico = obterSankhyaServiceDisponivel();
        if (servico) {
          resolverComServico(servico);
          return;
        }

        resolvido = true;
        contexto.clearInterval(verificador);
        contexto.removeEventListener(EVENTO_SANKHYA_PRONTO, resolverQuandoPronto);
        promessaSankhyaService = null;
        const erroBootstrap = contexto.__sankhyaBridgeBootstrapErro;
        reject(new Error(
          erroBootstrap?.message ||
          "O SankhyaService nÃ£o ficou pronto a tempo. Verifique o bootstrap do index.jsp."
        ));
      }, TEMPO_ESPERA_SANKHYA_MS);

      const verificador = contexto.setInterval(resolverQuandoPronto, INTERVALO_VERIFICACAO_SANKHYA_MS);

      function resolverComServico(servico) {
        if (resolvido) return;
        resolvido = true;
        contexto.clearTimeout(timeout);
        contexto.clearInterval(verificador);
        contexto.removeEventListener(EVENTO_SANKHYA_PRONTO, resolverQuandoPronto);
        resolve(servico);
      }

      function resolverQuandoPronto() {
        const servico = obterSankhyaServiceDisponivel();
        if (!servico) return;
        resolverComServico(servico);
      }

      contexto.addEventListener(EVENTO_SANKHYA_PRONTO, resolverQuandoPronto);
      resolverQuandoPronto();
    });
  }

  return promessaSankhyaService;
}

export function consultaNativaDisponivel() {
  return typeof executeQuery === "function";
}

function parametroInvalido(parametro) {
  const valor = parametro?.value;
  return (
    valor === null ||
    valor === undefined ||
    Number.isNaN(valor) ||
    String(valor).trim().toLowerCase() === "null" ||
    String(valor).trim().toLowerCase() === "nan" ||
    String(valor).trim().toLowerCase() === "undefined"
  );
}

function validarParametrosConsulta(parametros = []) {
  parametros.forEach((parametro, index) => {
    if (parametroInvalido(parametro)) {
      throw new Error(`ParÃ¢metro invÃ¡lido na consulta Sankhya na posiÃ§Ã£o ${index + 1}.`);
    }
  });
}

export async function executarConsultaSankhya(sql, parametros = []) {
  if (!consultaNativaDisponivel()) {
    throw new Error("A funÃ§Ã£o nativa executeQuery nÃ£o estÃ¡ disponÃ­vel. Verifique se a JSP contÃ©m <snk:load/>.");
  }

  if (!Array.isArray(parametros)) {
    throw new Error("ParÃ¢metros de consulta Sankhya devem ser um array de objetos { value, type }.");
  }

  validarParametrosConsulta(parametros);

  return new Promise((resolve, reject) => {
    executeQuery(
      sql,
      parametros,
      (value) => {
        try {
          const dados = typeof value === "string" ? JSON.parse(value) : value;
          const linhas = normalizarLinhas(dados);
          console.log("[SQL] Linhas retornadas:", linhas.length, {
            sql,
            formato: descreverFormatoResposta(dados),
            dados
          });
          resolve(linhas);
        } catch (error) {
          reject(new Error("O Sankhya retornou uma resposta de consulta invÃ¡lida."));
        }
      },
      (value) => {
        console.error("Erro ao executar consulta no Sankhya:", value);
        const mensagem = typeof value === "string" ? value : value?.message;
        reject(new Error(mensagem || "NÃ£o foi possÃ­vel consultar os dados no Sankhya."));
      }
    );
  });
}

export async function executarSalvamentoSankhya(dados, instancia, chavesPrimarias) {
  const dadosComChaves = { ...dados, ...(chavesPrimarias || {}) };
  const nomesCampos = Object.keys(dadosComChaves);
  const camposConvertidos = nomesCampos.reduce((campos, nome) => {
    campos[nome.toUpperCase()] = { $: String(dadosComChaves[nome]) };
    return campos;
  }, {});

  const payload = {
    serviceName: "CRUDServiceProvider.saveRecord",
    requestBody: {
      dataSet: {
        rootEntity: instancia,
        includePresentationFields: "N",
        dataRow: {
          localFields: camposConvertidos
        },
        entity: {
          fieldset: {
            list: nomesCampos.map((nome) => nome.toUpperCase()).join(",")
          }
        }
      }
    }
  };

  try {
    const resposta = await fetch("/mge/service.sbr?serviceName=CRUDServiceProvider.saveRecord&outputType=json", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();

    if (!resposta.ok || Number(resultado?.status) !== 1) {
      throw new Error(extrairMensagemErroSankhya(resultado, `NÃ£o foi possÃ­vel salvar o registro em ${instancia}.`));
    }

    return resultado.responseBody;
  } catch (error) {
    console.error(`Erro ao salvar registro na instÃ¢ncia ${instancia}:`, error);
    throw new Error(error?.message || `NÃ£o foi possÃ­vel salvar o registro em ${instancia}.`);
  }
}

function extrairMensagemErroSankhya(resultado, fallback) {
  const candidatos = [
    resultado?.statusMessage,
    resultado?.responseBody?.statusMessage,
    resultado?.responseBody?.message,
    resultado?.responseBody?.error,
    resultado?.message,
    resultado?.error
  ];
  const mensagem = candidatos.find((item) => item !== undefined && item !== null && String(item).trim());

  if (mensagem) return String(mensagem);

  try {
    const resposta = JSON.stringify(resultado);
    if (resposta && resposta !== "{}") {
      return `${fallback} Retorno Sankhya: ${resposta.slice(0, 600)}`;
    }
  } catch {
    // Mantem a mensagem padrao quando a resposta nao puder ser serializada.
  }

  return fallback;
}

export async function executarCrudSaveSankhya(dados, entidade) {
  const sankhyaService = await aguardarSankhyaService();

  const campos = Object.entries(dados)
    .filter(([, valor]) => {
      if (valor === undefined || valor === null || Number.isNaN(valor)) return false;
      const textoValor = String(valor).trim().toLowerCase();
      return textoValor !== "null" && textoValor !== "undefined" && textoValor !== "nan";
    })
    .map(([nome, valor]) => ({
      nome: nome.toUpperCase(),
      $: valor
    }));

  if (!campos.length) {
    throw new Error("Nenhum dado informado para salvamento.");
  }

  try {
    const requestBody = {
      entity: {
        name: entidade,
        campo: campos
      }
    };

    console.log("[CRUD SAVE] Request:", requestBody);
    const resultado = await sankhyaService.salvar(requestBody);
    console.log("[CRUD SAVE] Response:", resultado);

    if (Number(resultado?.status) !== 1) {
      throw new Error(extrairMensagemErroSankhya(resultado, `NÃ£o foi possÃ­vel salvar o registro em ${entidade}.`));
    }

    return resultado.responseBody;
  } catch (error) {
    console.error(`Erro ao salvar registro na entidade ${entidade}:`, error);
    throw new Error(error?.message || `NÃ£o foi possÃ­vel salvar o registro em ${entidade}.`);
  }
}

export async function executarCrudFindSankhya(entidade, campos, criterio = "") {
  const sankhyaService = await aguardarSankhyaService();

  const requestBody = {
    entity: {
      name: entidade,
      fields: {
        field: campos.map((campo) => ({ name: campo.toUpperCase() }))
      }
    }
  };

  if (criterio) {
    requestBody.entity.literalCriteria = {
      expression: {
        $: criterio
      }
    };
  }

  try {
    console.log("[CRUD FIND] Request:", requestBody);
    const resultado = await sankhyaService.consultar(requestBody);
    console.log("[CRUD FIND] Response:", resultado);
    return normalizarEntidadesCrud(resultado);
  } catch (error) {
    console.error(`Erro ao consultar entidade ${entidade}:`, error);
    throw new Error(error?.statusMessage || error?.message || `NÃ£o foi possÃ­vel consultar os dados em ${entidade}.`);
  }
}

export function normalizarEntidadesCrud(resultado) {
  const entidade = resultado?.responseBody?.entidades?.entidade;
  if (!entidade) return [];
  return Array.isArray(entidade) ? entidade : [entidade];
}

export function obterValorCampoCrud(registro, campo) {
  if (!registro || !campo) return "";

  const valor = registro?.[campo];
  if (valor && typeof valor === "object" && "$" in valor) return valor.$;
  if (valor !== undefined && valor !== null) return valor;

  const campoUpper = String(campo).toUpperCase();
  const chaveEncontrada = Object.keys(registro).find((chave) => chave.toUpperCase() === campoUpper);
  if (chaveEncontrada) {
    const valorPorChave = registro[chaveEncontrada];
    if (valorPorChave && typeof valorPorChave === "object" && "$" in valorPorChave) return valorPorChave.$;
    return valorPorChave ?? "";
  }

  const campos = Array.isArray(registro.campo) ? registro.campo : [];
  const campoEncontrado = campos.find((item) => String(item?.nome || item?.name || "").toUpperCase() === campoUpper);
  if (campoEncontrado) return campoEncontrado.$ ?? campoEncontrado.valor ?? campoEncontrado.value ?? "";

  return "";
}

export async function buscarDados(configuracao) {
  validarConfiguracao(configuracao);
  return obterAdaptadorDados().buscar(configuracao);
}

export async function inserirDados({ tabela, dados }) {
  validarConfiguracao({ tabela });
  const dadosLimpos = removerCamposVazios(dados);
  if (!Object.keys(dadosLimpos).length) throw new Error("Nenhum dado informado para inserÃ§Ã£o.");
  return obterAdaptadorDados().inserir({ tabela, dados: dadosLimpos });
}

export async function atualizarDados({ tabela, dados, filtros }) {
  validarConfiguracao({ tabela, filtros });
  if (!filtros?.length) throw new Error("AtualizaÃ§Ãµes exigem ao menos um filtro.");
  const dadosLimpos = removerCamposVazios(dados);
  if (!Object.keys(dadosLimpos).length) throw new Error("Nenhum dado informado para atualizaÃ§Ã£o.");
  return obterAdaptadorDados().atualizar({ tabela, dados: dadosLimpos, filtros });
}

export async function excluirDados({ tabela, filtros }) {
  validarConfiguracao({ tabela, filtros });
  if (!filtros?.length) throw new Error("ExclusÃµes exigem ao menos um filtro.");
  return obterAdaptadorDados().excluir({ tabela, filtros });
}

export async function executarTransacao(operacao) {
  return obterAdaptadorDados().transacao(operacao);
}

