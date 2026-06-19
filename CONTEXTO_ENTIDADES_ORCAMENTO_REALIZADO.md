# Contexto de entidades — Orçamento x Realizado

Este documento define as entidades e os nomes exatos de tabelas e campos que serão manipulados pelo aplicativo **Orçamento x Realizado** integrado ao ERP Sankhya.

## Regras gerais para o desenvolvimento

- Não inventar ou renomear tabelas e campos definidos neste documento.
- Utilizar os cadastros nativos do ERP como fonte dos dados oficiais.
- As tabelas `AD_*` guardam somente configurações, permissões e dados próprios do aplicativo.
- Empresa, centro de resultado, conta contábil e usuário devem manter vínculo com seus respectivos cadastros nativos.
- Valores monetários devem ser tratados como números decimais, nunca como texto.
- Datas de auditoria devem armazenar data e hora.
- Campos de situação devem utilizar `S` para ativo e `N` para inativo, quando aplicável.
- O orçamento deve possuir exercício e versão para não misturar anos ou revisões diferentes.
- O rateio mensal deve ser armazenado em linhas, uma por mês, e não em 12 colunas.

---

# 1. Entidades nativas do ERP

## 1.1. `TCBMET` — Meta Contábil

Nome da instância no Sankhya: `MetaContabil`  
Descrição da instância: `Meta Contábil`

Campos identificados:

| Campo | Descrição | Tipo |
|---|---|---|
| `CODCCO` | Código | Número Inteiro | incremental 
| `CODEMP` | Empresa | Número Inteiro |
| `CODCTACTB` | Conta Contábil | Número Inteiro |
| `CODPROJ` | Projeto | Número Inteiro |
| `NUPERIODOCTB` | Período Contábil | Número Inteiro |
| `CODCENCUS` | Centro de Custo | Número Inteiro |
| `DTREF` | Referência | Data |
| `PREVISTO` | Previsto | Número Decimal |
| `REALIZADO` | Realizado | Número Decimal |
| `DHALTER` | Referência | Data |
| `RECDESP` | Tipo Meta | Texto |

### Uso no aplicativo

A `TCBMET` é uma entidade nativa que já representa meta contábil por empresa, conta contábil, centro de custo e referência. Antes de gravar definitivamente o orçamento nas tabelas adicionais, validar se a regra do projeto deverá:

1. alimentar também a `TCBMET`; ou
2. manter o orçamento apenas nas tabelas `AD_ORCAMENTO` e `AD_ORCAMENTOMES`.

Não gravar diretamente na `TCBMET` sem validar as regras nativas, eventos e funções disponibilizadas pelo Sankhya.

---

## 1.2. `TCBPLA` — Plano de Contas

Nome da instância no Sankhya: `PlanoConta`  
Descrição da instância: `Plano de Contas`

Campos identificados:

| Campo | Descrição | Tipo |
|---|---|---|
| `CODCTACTB` | Conta reduzida | Número Inteiro |
| `DESCRCTA` | Descrição | Texto |
| `CODLALURB` | Código Parte B do e-LALUR | Texto |
| `CTACTB` | Conta contábil | Texto |
| `PODELANCTOMAN` | Aceita lançamento manual | Texto |
| `CODCONTA` | Código da Conta | Número Inteiro |
| `DESCRCONTA` | Descrição | Texto |
| `TABELALALURB` | Tabela lalurb | Texto |
| `ANALITICA` | Analítica | Texto |
| `PROJOBRIG` | Projeto obrigatório | Texto |
| `CENCUSOBRIG` | Centro de Resultado obrigatório | Texto |
| `BEMORIGINAL` | Bem Original | Texto |
| `BEMRESREAV` | Reserva de Reavaliação | Texto |
| `BEMOUTROS` | Outros acréscimos | Texto |
| `ATIVA` | Ativa | Texto |
| `CODGRUPOCTA` | Grupo de Conta | Texto |
| `RECDESP` | Tipo | Texto |
| `CODCTACTBSUBST` | Conta Substituta | Número Inteiro |
| `DTINCLUSAO` | Referência de ativação | Data e Hora |
| `DTINATIV` | Referência de inativação | Data e Hora |
| `DTALTER` | Dt. Alteração | Data e Hora |
| `CODUSU` | Usuário | Número Inteiro |
| `CODEMP` | Código da empresa | Número Inteiro |
| `GRAU` | Grau | Número Inteiro |
| `OBSERVACOES` | Observação | Texto |
| `PROCESSO` | Processo | Número Inteiro |
| `PRODUTO` | Produto | Número Inteiro |
| `PLANTA` | Planta | Número Inteiro |
| `CODCTACTBPAI` | Cód. conta reduzida pai | Número Inteiro |
| `CONVSALDOMOED` | Conversão do saldo para moeda | Texto |
| `DTBASECONVMOE` | Data base conversão de moeda | Texto |
| `LALUR_A` | Parte A do e-LALUR | Texto |
| `LALUR_A_CRED` | Part A of e-LALUR (Saldo Credor) | Texto |
| `INDTRIBLALURB` | Indicador Tributos Parte B do e-LALUR | Texto |
| `TIPSALALUR` | Tipo de Saldo e-LALUR | Número Inteiro |
| `CODRAZAUX` | Cód. Razão Auxiliar | Número Inteiro |
| `TABELA` | Tabela | Texto |
| `TABELACRED` | Tabela | Texto |
| `NATUREZAEFD` | Natureza para EFD | Número Inteiro |
| `ESTORNO` | Conta de estorno | Texto |
| `CLASSIFIRPJ` | Classificação IRPJ | Texto |
| `CLASSIFCSLL` | Classificação CSLL | Texto |
| `ADICOESIRPJ` | (+) Adições | Texto |
| `EXCLUSOESIRPJ` | (-) Exclusões | Texto |
| `PAT4IRPJ` | PAT 4% | Texto |
| `CONRESULTIRPJ` | Conta de Resultado | Texto |
| `ZERACRIRPJ` | Zeramento de Contas de Resultado | Texto |
| `ADICOESCSLL` | (+) Adições | Texto |
| `EXCLUSOESCSLL` | (-) Exclusões | Texto |
| `CONRESULTCSLL` | Conta de Resultado | Texto |
| `ZERACRCSLL` | Zeramento de Contas de Resultado | Texto |
| `AD_CTAESTKAR` | Conta de Estoque Kardex | Texto / Lista de Opções |

### Campos principais da `TCBPLA` para o aplicativo

- `CODCTACTB`: identificador da conta contábil e chave usada nos relacionamentos.
- `CTACTB`: código/classificação textual da conta.
- `DESCRCTA`: descrição da conta.
- `CODEMP`: empresa do plano de contas.
- `ANALITICA`: indica se a conta aceita detalhamento/lançamento.
- `ATIVA`: indica se a conta está ativa.
- `RECDESP`: natureza/tipo da conta.
- `CENCUSOBRIG`: indica se o centro de resultado é obrigatório.
- `CODCTACTBPAI`: conta contábil pai.

---

# 2. Outras entidades nativas referenciadas

Estas entidades já existem no ERP e não devem ser recriadas:

| Tabela | Finalidade | Campo de vínculo |
|---|---|---|
| `TSIEMP` | Empresas | `CODEMP` |
| `TSICUS` | Centros de resultado/custo | `CODCENCUS` |
| `TSIUSU` | Usuários do ERP | `CODUSU` |
| `TCBPLA` | Plano de contas | `CODCTACTB` |
| `TCBMET` | Metas contábeis nativas | combinação dos campos da meta |

---

# 3. Tabelas adicionais do aplicativo

## 3.1. `AD_ORCEMP` — Empresas disponíveis no aplicativo

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `IDORCEMP` | Número Inteiro | Chave primária |
| `CODEMP` | Número Inteiro | FK para `TSIEMP.CODEMP` |
| `NOME` | Texto | Nome amigável exibido no aplicativo |
| `ATIVO` | Texto(1) | `S` ou `N` |
| `CODUSUINC` | Número Inteiro | Usuário que incluiu |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário da última alteração |
| `DHALT` | Data e Hora | Data da última alteração |

Restrições:

- PK: `IDORCEMP`
- UK: `CODEMP`

---

## 3.2. `AD_ORCCUS` — Centros de resultado disponíveis

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `ID` | Número Inteiro | Chave primária |
| `CODCENCUS` | Número Inteiro | FK para `TSICUS.CODCENCUS` |
| `NOMEA` | Texto | Nome amigável exibido no aplicativo |
| `ATIVO` | Texto(1) | `S` ou `N` |
| `CODUSUINC` | Número Inteiro | Usuário que incluiu |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário da última alteração |
| `DHALT` | Data e Hora | Data da última alteração |

Restrições:

- PK: `ID`
- UK: `CODCENCUS`

---

## 3.3. `AD_ORCCTA` — Contas contábeis disponíveis

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `IDORCCTA` | Número Inteiro | Chave primária |
| `CODCTACTB` | Número Inteiro | FK para `TCBPLA.CODCTACTB` |
| `NOME` | Texto | Nome amigável exibido no aplicativo |
| `DESCRICAO` | Texto | Orientação/finalidade apresentada na seleção da conta |
| `ATIVO` | Texto(1) | `S` ou `N` |
| `CODUSUINC` | Número Inteiro | Usuário que incluiu |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário da última alteração |
| `DHALT` | Data e Hora | Data da última alteração |

Restrições:

- PK: `IDORCCTA`
- UK: `CODCTACTB`

---

## 3.4. `AD_ORCUSU` — Configuração dos usuários no aplicativo

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `IDORCUSU` | Número Inteiro | Chave primária |
| `CODUSU` | Número Inteiro | FK para `TSIUSU.CODUSU` |
| `NOMEAPP` | Texto | Nome exibido no aplicativo |
| `CARGO` | Texto | Cargo/função exibida |
| `TIPOUSU` | Texto(1) | `N`, `A` ou `D` |
| `ATIVO` | Texto(1) | `S` ou `N` |

Valores de `TIPOUSU`:

- `N`: Normal
- `A`: Administrador
- `D`: Administrativo

Restrições:

- PK: `IDORCUSU`
- UK: `CODUSU`

---

## 3.5. `AD_ORCUSUCUS` — Centros permitidos por usuário

Tabela associativa do relacionamento N:N entre usuários do aplicativo e centros de resultado.

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `IDORCUSUCUS` | Número Inteiro | Chave primária |
| `IDORCUSU` | Número Inteiro | FK para `AD_ORCUSU.IDORCUSU` |
| `IDORCCUS` | Número Inteiro | FK para `AD_ORCCUS.IDORCCUS` |
| `ATIVO` | Texto(1) | `S` ou `N` |

Restrições:

- PK: `IDORCUSUCUS`
- UK composta: `IDORCUSU`, `IDORCCUS`

---

## 3.6. `AD_ORCAMENTO` — Cabeçalho do orçamento

Cada registro representa uma combinação de exercício, versão, empresa, centro de resultado e conta contábil.

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `NUORC` | Número Inteiro | Chave primária do orçamento |
| `EXERCICIO` | Número Inteiro | Ano do orçamento |
| `VERSAO` | Número Inteiro | Versão/revisão do orçamento |
| `CODEMP` | Número Inteiro | FK para `TSIEMP.CODEMP` |
| `CODCENCUS` | Número Inteiro | FK para `TSICUS.CODCENCUS` |
| `CODCTACTB` | Número Inteiro | FK para `TCBPLA.CODCTACTB` |
| `VLRORCADO` | Número Decimal | Total anual orçado |
| `STATUS` | Texto | Situação do orçamento |
| `OBSERVACAO` | Texto | Observações do lançamento |
| `CODUSURESP` | Número Inteiro | FK para `TSIUSU.CODUSU`; responsável |
| `CODUSUINC` | Número Inteiro | Usuário que incluiu |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário da última alteração |
| `DHALT` | Data e Hora | Data da última alteração |

Valores previstos para `STATUS`:

- `RASCUNHO`
- `ABERTO`
- `APROVADO`
- `BLOQUEADO`

Restrições:

- PK: `NUORC`
- UK composta: `EXERCICIO`, `VERSAO`, `CODEMP`, `CODCENCUS`, `CODCTACTB`

Regra de integridade:

```text
AD_ORCAMENTO.VLRORCADO = soma de AD_ORCAMENTOMES.VLRORCADO para o mesmo NUORC
```

---

## 3.7. `AD_ORCAMENTOMES` — Rateio mensal do orçamento

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `NUORC` | Número Inteiro | FK para `AD_ORCAMENTO.NUORC` |
| `MES` | Número Inteiro | Mês de 1 a 12 |
| `VLRORCADO` | Número Decimal | Valor orçado no mês |
| `CODUSUALT` | Número Inteiro | Usuário da última alteração |
| `DHALT` | Data e Hora | Data da última alteração |

Restrições:

- PK composta: `NUORC`, `MES`
- `MES` deve aceitar apenas valores entre `1` e `12`.

---

## 3.8. `AD_ORCREAL` — Realizado manual, se necessário

Esta tabela só deverá ser utilizada se o realizado não for obtido automaticamente dos lançamentos contábeis do ERP.

| Campo | Tipo lógico | Regra/relacionamento |
|---|---|---|
| `NUREAL` | Número Inteiro | Chave primária |
| `NUORC` | Número Inteiro | FK para `AD_ORCAMENTO.NUORC` |
| `MES` | Número Inteiro | Mês de 1 a 12 |
| `VLRREALIZADO` | Número Decimal | Valor realizado no mês |
| `OBSERVACAO` | Texto | Justificativa ou observação |
| `CODUSUINC` | Número Inteiro | Usuário que incluiu |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário da última alteração |
| `DHALT` | Data e Hora | Data da última alteração |

Restrições:

- PK: `NUREAL`
- UK composta: `NUORC`, `MES`
- `MES` deve aceitar apenas valores entre `1` e `12`.

---

# 4. Relacionamentos

```text
TSIEMP.CODEMP
    ├── AD_ORCEMP.CODEMP
    └── AD_ORCAMENTO.CODEMP

TSICUS.CODCENCUS
    ├── AD_ORCCUS.CODCENCUS
    └── AD_ORCAMENTO.CODCENCUS

TCBPLA.CODCTACTB
    ├── AD_ORCCTA.CODCTACTB
    ├── AD_ORCAMENTO.CODCTACTB
    └── TCBMET.CODCTACTB

TSIUSU.CODUSU
    ├── AD_ORCUSU.CODUSU
    └── AD_ORCAMENTO.CODUSURESP

AD_ORCUSU.IDORCUSU
    └── AD_ORCUSUCUS.IDORCUSU

AD_ORCCUS.IDORCCUS
    └── AD_ORCUSUCUS.IDORCCUS

AD_ORCAMENTO.NUORC
    ├── AD_ORCAMENTOMES.NUORC
    └── AD_ORCREAL.NUORC
```

Correspondência entre orçamento adicional e meta contábil nativa:

```text
AD_ORCAMENTO.CODEMP       = TCBMET.CODEMP
AD_ORCAMENTO.CODCENCUS    = TCBMET.CODCENCUS
AD_ORCAMENTO.CODCTACTB    = TCBMET.CODCTACTB
AD_ORCAMENTOMES.MES/ANO   = TCBMET.DTREF
AD_ORCAMENTOMES.VLRORCADO = TCBMET.PREVISTO
```

O campo `TCBMET.REALIZADO` pode ser utilizado na consulta comparativa caso seja alimentado corretamente pelo processo contábil nativo.

---

# 5. Fluxos de manipulação

## Cadastro de empresa

1. Consultar a empresa em `TSIEMP`.
2. Gravar a configuração em `AD_ORCEMP`.
3. Não duplicar razão social, CNPJ ou demais dados oficiais da empresa.

## Cadastro de centro de resultado

1. Consultar o centro em `TSICUS`.
2. Gravar a configuração em `AD_ORCCUS`.
3. Vincular usuários por meio de `AD_ORCUSUCUS`.

## Cadastro de conta contábil

1. Consultar a conta em `TCBPLA`.
2. Utilizar `TCBPLA.CODCTACTB` como identificador.
3. Preferencialmente permitir apenas contas ativas e analíticas.
4. Gravar nome amigável e orientação em `AD_ORCCTA`.

## Cadastro de usuário

1. Obter o usuário logado/cadastrado em `TSIUSU`.
2. Gravar configurações do aplicativo em `AD_ORCUSU`.
3. Gravar os centros permitidos em `AD_ORCUSUCUS`.

## Lançamento do orçamento

1. Identificar `EXERCICIO` e `VERSAO`.
2. Selecionar empresa, centro de resultado e conta contábil.
3. Criar ou atualizar `AD_ORCAMENTO`.
4. Gravar exatamente 12 registros em `AD_ORCAMENTOMES`.
5. Validar que a soma mensal seja igual a `AD_ORCAMENTO.VLRORCADO`.
6. Caso haja integração com metas nativas, executar a função nativa definida para atualizar `TCBMET`.

## Realizado

Ordem de preferência:

1. Consultar o realizado contabilizado pelo ERP, agrupado por empresa, centro, conta e mês.
2. Utilizar `TCBMET.REALIZADO` se esse campo representar corretamente o realizado na regra da empresa.
3. Usar `AD_ORCREAL` apenas quando o realizado for obrigatoriamente manual.

---

# 6. Lista fechada de nomes

## Tabelas adicionais

```text
AD_ORCEMP
AD_ORCCUS
AD_ORCCTA
AD_ORCUSU
AD_ORCUSUCUS
AD_ORCAMENTO
AD_ORCAMENTOMES
AD_ORCREAL
```

## Tabelas nativas principais

```text
TCBMET
TCBPLA
TSIEMP
TSICUS
TSIUSU
```

O código deve utilizar esses nomes exatamente como definidos, salvo correção confirmada diretamente no dicionário de dados do ambiente Sankhya.

---

# 7. Empacotamento e publicação no Sankhya

## 7.1. Estrutura obrigatória do `index.jsp`

O arquivo publicado no Sankhya é `dist/index.jsp`. O `index.html` gerado pelo Vite não deve ser usado diretamente como página de entrada do aplicativo.

A estrutura abaixo foi ajustada e validada manualmente no ambiente:

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false"%>
<%@ page import="java.util.*" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %>

<%
    String embedded = request.getParameter("embedded");
    String nuGdg = request.getParameter("nuGdg");

    if (nuGdg == null || !nuGdg.matches("\\d+")) {
        nuGdg = "010";
    }
%>

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <snk:load/>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lançamento Orçamentário</title>
    <link rel="stylesheet" crossorigin href="${BASE_FOLDER}/assets/ARQUIVO_CSS_GERADO.css">
  </head>
  <body style="margin:0; padding:0; overflow:hidden;">
    <% if (!"true".equals(embedded)) { %>
      <script>
        (function () {
          try {
            var dynaGadget = window.parent.document.getElementsByClassName("dyna-gadget")[0];
            var dashWindow = window.parent.document.getElementsByClassName("DashWindow")[0];

            if (dashWindow && dynaGadget) {
              var srcIframe = "/mge/html5component.mge?entryPoint=index.jsp&nuGdg=<%= nuGdg %>&embedded=true";

              setTimeout(function () {
                dynaGadget.innerHTML =
                  '<iframe src="' + srcIframe + '" class="gwt-Frame" style="width:100%; height:100%; border:none;"></iframe>';
              }, 100);
            }
          } catch (error) {
            console.log("Erro ao substituir gadget:", error);
          }
        })();
      </script>
    <% } else { %>
      <div id="root" data-base-folder="${BASE_FOLDER}"></div>
      <script type="module" crossorigin src="${BASE_FOLDER}/assets/ARQUIVO_JS_GERADO.js"></script>
    <% } %>
  </body>
</html>
```

Regras para novas gerações:

- Manter `isELIgnored="false"`, pois `${BASE_FOLDER}` precisa ser interpretado pelo JSP.
- Manter a taglib Sankhya e executar `<snk:load/>` dentro do `<head>`.
- Reaproveitar o parâmetro `nuGdg` recebido pela página; usar `010` somente quando ele não for informado ou não for numérico.
- Na abertura externa, aguardar 100 ms e substituir o conteúdo de `.dyna-gadget` por um iframe com `embedded=true`.
- Montar o React somente quando `embedded=true`, evitando que a página recrie o iframe continuamente.
- Referenciar CSS, JavaScript e demais arquivos publicados com o prefixo `${BASE_FOLDER}/`.
- Disponibilizar `${BASE_FOLDER}` ao React pelo atributo `data-base-folder` do elemento `#root`; imagens usadas pelos componentes devem montar a URL a partir desse valor.
- A logo da sidebar deve resultar no caminho `${BASE_FOLDER}/images/logo_akrus_branco.png` no ambiente Sankhya.
- Após cada `npm run build`, conferir em `dist/assets` os nomes reais dos arquivos com hash e atualizar as duas referências do `index.jsp`.
- Não copiar para o JSP a referência de desenvolvimento `/src/main.jsx` existente no `index.html` da raiz.
- Não substituir automaticamente o `index.jsp` validado pelo `dist/index.html` gerado pelo Vite.
- Incluir no pacote de publicação o `index.jsp`, a pasta `assets` e as demais pastas ou arquivos usados pela aplicação, como `images` e `manual-orcamento.pdf` quando existirem.

---

# 8. Filtro de período

As telas de **Orçamento** e **Realizado** possuem um filtro único de período, com mês inicial e mês final.

O botão deve ser identificado como **Filtrar visualização**, deixando claro que o período altera somente os valores consultados e não o período dos lançamentos.

Regras funcionais:

- O padrão é o ano completo, de janeiro a dezembro.
- Para consultar apenas um mês, o mês inicial e o mês final devem ser iguais.
- Para consultar um intervalo, o usuário informa o primeiro e o último mês do período.
- O filtro permanece ativo durante a navegação entre grupo empresarial, empresa e centro de resultado dentro da mesma tela.
- O valor exibido no grupo empresarial deve ser a soma dos meses filtrados de todas as empresas do grupo.
- O valor exibido na empresa deve ser a soma dos meses filtrados de todos os seus centros e contas.
- O valor exibido no centro de resultado deve ser a soma dos meses filtrados de todas as suas contas.
- O valor exibido na conta deve considerar somente os meses do período selecionado.
- O detalhamento mensal deve exibir somente as colunas compreendidas pelo filtro.
- A exportação do orçamento deve respeitar o período ativo e identificar o período exportado.
- Limpar o filtro restaura a visão anual de janeiro a dezembro.

## 8.1. Ajuda durante o lançamento

- O botão flutuante da tela de orçamento é exclusivo para **Ajuda** e deve exibir o ícone de interrogação.
- O botão não deve abrir outras ações nem permitir adicionar lançamentos.
- A ajuda deve permanecer disponível desde a seleção do grupo empresarial até a etapa final de rateio dos valores mês a mês.
