# Padrões de desenvolvimento de dashboards HTML5 no Sankhya

> Documento de contexto para uso pelo Codex na criação e manutenção de dashboards, gadgets e componentes HTML5 executados dentro do Sankhya-W.

## 1. Objetivo e escopo

Este documento consolida os padrões identificados nos projetos fornecidos e os transforma em regras práticas para desenvolvimento. Ele cobre:

- componentes HTML5 baseados em JSP;
- consultas SQL executadas no servidor com `<snk:query>`;
- consultas dinâmicas executadas no navegador com `executeQuery`;
- parâmetros de dashboard e tipos aceitos;
- navegação entre níveis, atualização de componentes e abertura de telas;
- definição de gadgets por XML;
- organização de arquivos para empacotamento;
- aplicação AngularJS integrada aos componentes internos `sk-*` do Sankhya;
- chamadas de serviços internos, CRUD, datasets, dynaforms, pop-ups e ações Java;
- diferenças entre Oracle e SQL Server;
- segurança, compatibilidade, desempenho e critérios de publicação.

As conclusões foram extraídas dos seguintes exemplos:

- `modeloComponenteHtml5Simples`;
- `modeloComponenteHtml5SimplesJS`;
- `modeloComponenteHtml5Completo`;
- `primeiro_dash_menu_html5_sankhya`;
- `448_html5Component`.

## 2. Classificação dos padrões encontrados

Há três arquiteturas diferentes no material. Elas não devem ser misturadas sem necessidade.

### 2.1. Componente JSP simples

Indicado para cards, tabelas, indicadores, gráficos em JavaScript e telas de consulta. Utiliza:

- JSP como ponto de entrada;
- JSTL;
- taglib `snk`;
- `<snk:load/>`;
- `<snk:query>` ou `executeQuery`;
- HTML, CSS e JavaScript comuns;
- funções nativas de navegação do dashboard.

É o padrão preferencial para dashboards personalizados por ser menor, mais fácil de manter e menos dependente de APIs internas.

### 2.2. Gadget declarativo em XML

Indicado para definir:

- parâmetros globais;
- níveis do dashboard;
- containers e proporções;
- componentes HTML5;
- gráficos nativos;
- argumentos transmitidos entre níveis.

O XML funciona como composição do dashboard, enquanto os arquivos JSP implementam os componentes visuais.

### 2.3. Aplicação AngularJS integrada ao framework Sankhya

Indicada para telas operacionais complexas que precisam de:

- `sk-application` e componentes `sk-*`;
- dynaform e dataset;
- CRUD de entidades;
- interceptadores;
- pop-ups internos;
- ações Java;
- serviços internos do Sankhya.

Esse padrão possui forte acoplamento à versão do Sankhya-W. Não deve ser escolhido para um dashboard apenas visual quando JSP + JavaScript resolvem o problema.

## 3. Estrutura mínima de um componente JSP

Modelo recomendado:

```jsp
<%@ page language="java"
    contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"
    isELIgnored="false" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="${BASE_FOLDER}/assets/css/style.css">
    <snk:load/>
</head>
<body>
    <main id="app"></main>
    <script src="${BASE_FOLDER}/assets/js/app.js"></script>
</body>
</html>
```

### 3.1. Diretivas obrigatórias ou usuais

- `pageEncoding="UTF-8"`: evita perda de acentos no arquivo JSP.
- `contentType="text/html; charset=UTF-8"`: mantém a resposta HTTP coerente com o arquivo.
- `isELIgnored="false"`: habilita expressões como `${BASE_FOLDER}` e `${CODPARC}`.
- taglib JSTL `c`: fornece `c:forEach`, `c:out`, `c:if` etc.
- taglib `snk`: fornece `<snk:load/>` e `<snk:query>`.

Os exemplos antigos misturam `contentType="...ISO-8859-1"` com `pageEncoding="UTF-8"`. Para projetos novos, não repetir essa inconsistência: usar UTF-8 em toda a cadeia, desde que a versão instalada aceite normalmente esse encoding.

### 3.2. Posição de `<snk:load/>`

Deve ficar no `<head>`, depois dos estilos e antes dos scripts que dependem das funções nativas do dashboard. Essa tag carrega o contexto e as funções fornecidas pelo Sankhya.

Sem ela, funções como `executeQuery`, `openLevel`, `refreshDetails`, `openApp` e `openPage` podem não existir.

### 3.3. Uso de `${BASE_FOLDER}`

Todo recurso pertencente ao pacote deve usar caminho relativo à variável fornecida pelo Sankhya:

```html
<link rel="stylesheet" href="${BASE_FOLDER}/assets/css/style.css">
<script src="${BASE_FOLDER}/assets/js/app.js"></script>
<img src="${BASE_FOLDER}/assets/img/indicador.png" alt="Indicador">
```

Não usar caminho absoluto do computador, `file://`, caminho de desenvolvimento do Vite ou uma URL fixa do servidor.

## 4. Imports JSP: quando usar e quando evitar

### 4.1. Imports básicos encontrados

```jsp
<%@ page import="java.util.*" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="/WEB-INF/tld/sankhyaUtil.tld" prefix="snk" %>
```

`java.util.*` não é obrigatório se nenhuma classe Java desse pacote for utilizada. O Codex deve remover imports sem uso.

### 4.2. Imports internos encontrados no projeto AngularJS

```jsp
<%@ page import="br.com.sankhya.modelcore.profile.ApplicationProfileManager" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>
<%@ page import="br.com.sankhya.modelcore.util.MGECoreParameter" %>
<%@ page import="br.com.sankhya.mge.core.services.AdministracaoServidorSP" %>
```

Esses imports são internos e dependem das bibliotecas instaladas no servidor. Só devem ser usados quando há necessidade comprovada e após validação na versão do ambiente.

No exemplo, eles permitem obter perfil, nome da aplicação e usuário da sessão:

```jsp
<%
AuthenticationInfo auth =
    (AuthenticationInfo) session.getAttribute("usuarioLogado");
%>
```

Antes de acessar propriedades, validar `auth != null`. Nunca enviar ID de sessão, e-mail ou informações desnecessárias ao HTML.

### 4.3. Imports que não devem ser copiados automaticamente

```jsp
<%@ page import="java.sql.*" %>
<%@ page import="oracle.sql.*" %>
<%@ page import="java.io.*" %>
```

Eles aparecem no projeto complexo, mas não são utilizados no JSP analisado. Além de desnecessários, `oracle.sql.*` quebra portabilidade para SQL Server. O padrão é consultar por `<snk:query>`, `executeQuery` ou serviços do Sankhya, sem abrir JDBC diretamente no JSP.

## 5. Consultas com `<snk:query>`

Consulta executada durante a renderização do JSP:

```jsp
<snk:query var="parceiros">
    SELECT CODPARC, NOMEPARC
      FROM TGFPAR
     WHERE CODPARC IN (:CODPARC_LIST)
     ORDER BY CODPARC
</snk:query>
```

Renderização segura:

```jsp
<c:forEach items="${parceiros.rows}" var="row">
    <tr>
        <td><c:out value="${row.CODPARC}" /></td>
        <td><c:out value="${row.NOMEPARC}" /></td>
    </tr>
</c:forEach>
```

### 5.1. Regras

- Usar aliases claros e únicos.
- Referenciar as colunas retornadas pelo alias em maiúsculas, como nos exemplos.
- Preferir seleção explícita de colunas; evitar `SELECT *`.
- Usar parâmetros `:NOME_PARAMETRO`; não concatenar entrada do usuário no SQL.
- Usar `c:out` para escapar conteúdo exibido.
- Reservar `<snk:query>` para consultas que podem ser executadas na carga inicial.
- Evitar scriptlets Java para montar SQL. Quando uma condição é opcional, preferir uma condição SQL parametrizada ou `executeQuery` com placeholders.

### 5.2. Componente detalhe sem parâmetro

O exemplo usa `1 <> 1` quando `CODPARC` não foi recebido. O conceito é correto: um detalhe ainda não selecionado não deve carregar todos os registros.

Forma conceitual:

```sql
WHERE (:CODPARC IS NOT NULL AND CODPARC = :CODPARC)
```

A sintaxe exata para parâmetro ausente deve ser validada no construtor/versão do dashboard. Se o mecanismo não aceitar parâmetro inexistente, controlar a consulta no JSP ou iniciar o detalhe vazio.

## 6. Consultas dinâmicas com `executeQuery`

Assinatura observada:

```javascript
executeQuery(sql, parameters, onSuccess, onError);
```

Exemplo:

```javascript
const sql = `
    SELECT CODPARC, NOMEPARC
      FROM TGFPAR
     WHERE CODPARC = ?
`;

const parameters = [
    { value: "${CODPARC}", type: "I" }
];

executeQuery(
    sql,
    parameters,
    function (value) {
        const rows = JSON.parse(value);
        renderizar(rows);
    },
    function (error) {
        console.error(error);
    }
);
```

O retorno de sucesso observado é uma string JSON contendo um array de objetos.

### 6.1. Tipos de parâmetro identificados

| Tipo | Uso | Exemplo |
|---|---|---|
| `I` | inteiro | `{ value: "${CODPARC}", type: "I" }` |
| `S` | texto | `{ value: "${RAZAOSOCIAL}", type: "S" }` |
| `D` | data ou data/hora | `{ value: "${PERIODO.INI}", type: "D" }` |
| `IN` | lista para cláusula `IN` | `{ value: "${GRUPO}", type: "IN" }` |

### 6.2. Ordem dos placeholders

A ordem dos objetos no array deve ser exatamente a ordem dos `?` adicionados ao SQL. Ao montar filtros opcionais, adicionar simultaneamente a condição e o parâmetro.

```javascript
let sql = "SELECT CODPARC, NOMEPARC FROM TGFPAR WHERE 1 = 1";
const params = [];

if ("${CODPARC}" !== "") {
    sql += " AND CODPARC = ?";
    params.push({ value: "${CODPARC}", type: "I" });
}
```

### 6.3. Parâmetro de período

```javascript
if ("${PERIODO.INI}" !== "") {
    sql += " AND DTALTER >= ?";
    params.push({ value: "${PERIODO.INI}", type: "D" });
}

if ("${PERIODO.FIN}" !== "") {
    sql += " AND DTALTER < ? + 1";
    params.push({ value: "${PERIODO.FIN}", type: "D" });
}
```

Para Oracle, o padrão de fim exclusivo costuma incluir todo o último dia. Se o parâmetro já contiver hora, a regra deve ser ajustada. Para SQL Server, não copiar `+ 1` sem validar o tipo; usar a função adequada ao banco.

### 6.4. Lista múltipla

No material, uma lista múltipla é usada assim:

```javascript
const params = [{ value: "${MULTSQLTESTE}", type: "IN" }];
const sql = "SELECT ... WHERE CODPARC IN (?)";
```

O exemplo informa que, quando nenhum item é selecionado, o dashboard pode enviar todos os registros. Esse comportamento depende da configuração do parâmetro. O Codex deve verificar se a lista é obrigatória e nunca presumir que “sem seleção” significa `NULL`.

### 6.5. Lista simples

O exemplo registra dois estados sem seleção:

- `""` quando não existem opções;
- `"0"` quando existem opções, mas nenhuma foi selecionada.

Tratamento observado:

```javascript
if ("${SINGSQLTESTE}" !== "0" && "${SINGSQLTESTE}" !== "") {
    // aplica filtro
}
```

### 6.6. Segurança obrigatória

- Nunca interpolar texto do usuário diretamente no SQL.
- Usar `?` e o array tipado de parâmetros.
- Não montar `IN (${valor})` manualmente.
- Não inserir valores retornados do banco com `innerHTML` sem escape.
- Para tabelas dinâmicas, preferir `textContent`.
- Exibir ao usuário uma mensagem amigável e registrar detalhes técnicos apenas no console, sem dados sensíveis.

## 7. Funções nativas de dashboard

### 7.1. `openLevel`

Abre outro nível do mesmo dashboard:

```javascript
openLevel("lvl_detalhado", { CODPARC: Number(codParc) });
```

O ID deve existir no XML e os nomes/tipos devem corresponder aos `<arg>` do nível de destino.

### 7.2. `refreshDetails`

Atualiza um componente detalhe sem trocar de nível:

```javascript
refreshDetails("html5_contatos", { CODPARC: Number(codParc) });
```

O primeiro argumento é o ID exato do `<html5component>` no XML.

### 7.3. `openApp`

Abre um recurso/tela do Sankhya:

```javascript
openApp("resourceID", { CODPARC: Number(codParc) });
```

O `resourceID` é específico do ambiente. O material alerta que telas Flex e HTML5 podem se comportar de maneira diferente ao receber parâmetros.

### 7.4. `openPage`

Abre página externa ou rota suportada:

```javascript
openPage("https://exemplo.interno", {});
```

Validar políticas de iframe, domínio, autenticação e segurança. Não construir URL com dados confidenciais.

### 7.5. Regras de navegação

- Não fixar IDs de outro ambiente sem confirmação.
- Declarar IDs em constantes para facilitar manutenção.
- Converter campos numéricos com `Number`/`parseInt` quando o destino espera inteiro.
- Não usar `javascript:` no atributo `onclick`; chamar a função diretamente.
- Em links usados como botão, impedir a navegação padrão ou usar `<button type="button">`.

## 8. XML do gadget

Estrutura encontrada:

```xml
<gadget>
  <prompt-parameters>...</prompt-parameters>
  <level id="lvl_principal" description="Principal">...</level>
  <level id="lvl_detalhado" description="Detalhado">...</level>
</gadget>
```

### 8.1. Parâmetros

```xml
<parameter
    id="CODPARC_LIST"
    description="Parceiros"
    metadata="multiList:Text"
    listType="sql"
    required="false"
    keep-last="false"
    keep-date="false">
  <expression type="SQL"><![CDATA[
    SELECT CODPARC AS VALUE,
           NOMEPARC AS LABEL
      FROM TGFPAR
     ORDER BY CODPARC
  ]]></expression>
</parameter>
```

Regras:

- a consulta da lista deve retornar aliases `VALUE` e `LABEL`;
- o `id` é o nome usado no JSP/SQL;
- `metadata` define o tipo de controle;
- `required` deve refletir se a consulta suporta ausência de seleção;
- `keep-last` e `keep-date` afetam persistência do filtro;
- envolver SQL em CDATA evita conflito com caracteres XML.

### 8.2. Níveis e argumentos

```xml
<level id="lvl_detalhado" description="Detalhado">
  <args>
    <arg id="CODPARC" type="integer"/>
  </args>
  ...
</level>
```

O argumento recebido por `openLevel` deve ter mesmo nome e tipo.

### 8.3. Containers

```xml
<container orientacao="V" tamanhoRelativo="100">
  <container orientacao="V" tamanhoRelativo="50">
    <html5component id="html5_parceiros" entryPoint="parceiros.jsp"/>
  </container>
  <container orientacao="V" tamanhoRelativo="50">
    <html5component id="html5_contatos" entryPoint="contatos.jsp"/>
  </container>
</container>
```

- `entryPoint` deve existir no pacote.
- IDs devem ser únicos no gadget.
- Os tamanhos relativos dos filhos devem formar uma distribuição coerente.
- A orientação e os tamanhos devem ser testados na resolução real dos usuários.

### 8.4. Gráfico nativo

O XML analisado define gráfico `pizza`, SQL, metadados e série. Estrutura conceitual:

```xml
<chart id="cht_receita_despesa" type="pizza">
  <title><![CDATA[Receita e despesa]]></title>
  <expression type="sql" data-source="MGEDS"><![CDATA[
    SELECT TIPO, SUM(VALOR) AS VALOR
      FROM ...
     WHERE CODPARC = :CODPARC
     GROUP BY TIPO
  ]]></expression>
  <metadata>
    <field name="TIPO" label="Tipo" type="S" visible="true" useFooter="false"/>
    <field name="VALOR" label="Valor" type="F" visible="true" useFooter="false"/>
  </metadata>
  <series>
    <serie type="pizza">
      <field>VALOR</field>
      <nameField>TIPO</nameField>
    </serie>
  </series>
</chart>
```

Os nomes em `<field>` e `<nameField>` devem coincidir exatamente com os aliases SQL.

## 9. Oracle e SQL Server

O pacote apresenta XMLs separados para os bancos. As diferenças identificadas incluem:

| Finalidade | Oracle | SQL Server |
|---|---|---|
| limitar linhas | `ROWNUM < 20` | `TOP 20` |
| data atual | `SYSDATE` | `GETDATE()` |
| subtrair mês | `ADD_MONTHS(TRUNC(SYSDATE), -1)` | `DATEADD(month, -1, GETDATE())` |

Outras diferenças que o Codex deve considerar:

- `NVL` versus `ISNULL`/`COALESCE`;
- `TO_CHAR` versus `FORMAT`/`CONVERT`;
- concatenação `||` versus `+` ou `CONCAT`;
- `TRUNC(data)` versus conversão para `date`;
- paginação e funções analíticas;
- tratamento de booleanos, datas e aliases.

Nunca gerar um único SQL com sintaxe híbrida. Perguntar ou identificar qual banco o ambiente usa.

## 10. Aplicação AngularJS interna do Sankhya

### 10.1. Inicialização

O projeto complexo usa:

```javascript
angular
  .module("app", ["snk"])
  .controller("AppController", [
    "Criteria",
    "ObjectUtils",
    "MessageUtils",
    "SanPopup",
    "ServiceProxy",
    "SkApplicationInstance",
    function (Criteria, ObjectUtils, MessageUtils, SanPopup,
              ServiceProxy, SkApplicationInstance) {
      const self = this;
    }
  ]);
```

As dependências devem permanecer anotadas como array, pois isso suporta minificação e injeção por nome.

### 10.2. Bootstrap

O exemplo configura idioma e inicia o módulo após carregar o launcher:

```javascript
function startApplication() {
    angular.bootstrap(document, [ngAppName]);
}
```

Esse fluxo é específico do framework interno. Não usar `ng-app` simultaneamente se o bootstrap for manual.

### 10.3. Componentes `sk-*`

Foram identificados:

- `sk-application`;
- `sk-hbox` e `sk-vbox`;
- `sk-simple-form` e `sk-simple-item`;
- `sk-label`;
- `sk-icon`;
- `sk-divider`;
- `sk-top-bar`;
- `sk-pesquisa-input`;
- `sk-dynaform`;
- `sk-right-top-bar`.

Esses componentes dependem dos scripts e estilos internos do Sankhya-W. Não funcionam em um navegador isolado ou em uma aplicação React comum sem o runtime do ERP.

### 10.4. Dynaform

Exemplo conceitual:

```html
<sk-dynaform
    sk-entity-name="AD_TABELA"
    sk-on-dynaform-loaded="ctrl.onDynaformLoaded(dynaform,dataset)"
    sk-dynaform-interceptor="ctrl"
    sk-datagrid-interceptor="ctrl"
    sk-form-interceptor="ctrl">
</sk-dynaform>
```

O controlador implementa interfaces:

```javascript
ObjectUtils.implements(self, IDynaformInterceptor);
ObjectUtils.implements(self, IDatagridInterceptor);
ObjectUtils.implements(self, IFormInterceptor);
```

E captura dynaform/dataset no ciclo de vida:

```javascript
function onDynaformLoaded(dynaform, dataset) {
    if (dynaform.getEntityName() === "AD_TABELA") {
        dataset.setCanEdit(true);
        dataset.addCriteriaProvider(getCriteria);
        dataset.initAndRefresh();
    }
}
```

Evitar atributos duplicados no HTML. O exemplo contém `sk-form-interceptor` repetido; isso deve ser corrigido.

### 10.5. Criteria

O padrão observado cria filtros do dataset por meio de `Criteria` e placeholders:

```javascript
function getCriteria() {
    return new Criteria("CODCRE = ? AND ATIVO = 'S'", [codCre]);
}
```

Usar placeholders quando a API permitir. Não concatenar dados livres em `literalCriteria`.

### 10.6. Pop-ups

```javascript
SanPopup.open({
    title: "Seleção de recursos",
    templateUrl: BASE_FOLDER + "/popup/selecao.tpl.html",
    controller: "SelecaoController",
    controllerAs: "ctrl",
    size: "md",
    okBtnLabel: "Confirmar",
    resolve: {
        data: { NUAPO: self.NUAPO }
    }
}).result.then(function (result) {
    // processar retorno
});
```

Regras:

- usar `BASE_FOLDER` para o template;
- registrar o controller antes de abrir;
- passar somente os dados necessários em `resolve`;
- validar o resultado;
- tratar cancelamento/rejeição quando relevante.

### 10.7. Mensagens

Serviço identificado: `MessageUtils`.

Usos observados:

```javascript
MessageUtils.showInfo("Atenção", "Operação concluída.");
MessageUtils.showError("Erro", "Não foi possível concluir.");
MessageUtils.showAlert(MessageUtils.TITLE_WARNING, "Preencha os campos.");
MessageUtils.simpleConfirm("Deseja continuar?").then(onYes, onNo);
```

Não usar `alert` em telas complexas quando `MessageUtils` estiver disponível.

## 11. Serviços internos

### 11.1. Consulta CRUD

Padrão identificado:

```javascript
const request = {
    entity: {
        name: "Usuario",
        literalCriteria: {
            expression: { $: "CODUSU = " + codigo }
        },
        fields: {
            field: [
                { name: "CODUSU" },
                { name: "NOMEUSU" }
            ]
        }
    }
};

ServiceProxy.callService("mge@crud.find", request)
    .then(function (result) {
        // result.responseBody.entidades.entidade
    });
```

Cuidados:

- o formato de resposta pode representar um único registro como objeto e vários como array;
- normalizar o retorno para array;
- validar propriedades antes do acesso;
- não fazer recursão infinita quando o retorno vier vazio;
- `literalCriteria` concatenado é aceitável apenas com valor interno numérico previamente validado; para texto livre, usar mecanismo parametrizado.

### 11.2. Gravação

Serviços encontrados:

- `mge@crud.save`;
- `mge@DatasetSP.save`;
- comentário mencionando `mge@CRUDServiceProvider.saveRecord`.

Esses contratos podem variar. O Codex não deve inventar o corpo da requisição: deve partir de um exemplo validado na mesma versão ou da documentação do ambiente.

### 11.3. Execução de ação Java

Padrão:

```javascript
const request = {
    javaCall: {
        actionID: ACTION_ID_CONFIGURADO,
        refreshType: "ALL",
        rows: {
            row: [{
                field: [
                    { fieldName: "IDIPROC", $: ordem },
                    { fieldName: "NUMLOTE", $: lote }
                ]
            }]
        }
    }
};

ServiceProxy.callService("mge@ActionButtonsSP.executeJava", request);
```

Regras críticas:

- `actionID` é configuração do ambiente, não um padrão universal;
- `fieldName` deve corresponder ao contexto esperado pela ação;
- `refreshType` deve ser escolhido de acordo com a ação;
- bloquear duplo clique durante a promessa;
- tratar sucesso e erro;
- atualizar dataset somente após confirmação do serviço;
- não registrar payloads sensíveis no console de produção.

## 12. Sessão e usuário logado

O projeto obtém o usuário assim:

```jsp
<%
AuthenticationInfo auth =
    (AuthenticationInfo) session.getAttribute("usuarioLogado");
%>
<script>
    window.currentUser = {
        id: "<%= auth != null ? auth.getUserID().toString() : "" %>",
        name: "<%= auth != null ? auth.getName() : "" %>"
    };
</script>
```

Para produção, escapar valores antes de inseri-los em JavaScript. Nomes podem conter aspas e quebrar o script. Uma alternativa mais segura é inserir em elementos HTML com `c:out` ou serializar como JSON com biblioteca adequada disponível no servidor.

Nunca expor:

- `MGESESSION`;
- token de autenticação;
- senha;
- parâmetros internos completos;
- dados pessoais sem necessidade funcional.

## 13. Dependências do diretório `/mge`

O projeto AngularJS carrega diversos recursos internos, incluindo AngularJS, UI Grid, AG Grid, Moment, jqWidgets, TinyMCE, scripts `snk.js`, `launcher.js` e estilos Sankhya.

Esses caminhos demonstram disponibilidade naquele ambiente, mas não constituem garantia pública e permanente. Regras:

1. Carregar apenas o necessário.
2. Manter a ordem exigida pelas dependências.
3. Não duplicar AngularJS, jQuery ou bibliotecas já carregadas pelo runtime.
4. Validar os caminhos após atualização do Sankhya.
5. Não copiar a chave de licença do AG Grid encontrada no exemplo.
6. Não copiar o bloco integral de parâmetros internos `MGE_PARAMS` para projetos novos.
7. Não presumir que componentes internos `sk-*` são API estável.

Para dashboard simples, preferir `<snk:load/>` e assets próprios no pacote.

## 14. React/Vite dentro do componente Sankhya

O material analisado não contém React, mas o padrão de empacotamento permite usar uma aplicação compilada como assets estáticos, desde que o HTML/JSP de entrada seja compatível com o Sankhya.

Regras para build:

- gerar arquivos estáticos em `dist`;
- configurar o Vite com `base: './'` quando os assets forem resolvidos relativamente;
- se o `index.html` não processar `${BASE_FOLDER}`, usar caminhos relativos gerados pelo build;
- quando forem necessárias funções nativas (`openLevel`, `executeQuery`), o ponto de entrada deve carregar o contexto Sankhya, normalmente via JSP com `<snk:load/>`;
- não usar servidor Node em produção;
- não depender de rotas SPA que exigem rewrite do servidor; preferir uma única rota ou hash router;
- evitar módulos/browsers modernos sem validar o navegador homologado pela instalação;
- não carregar React pelo CDN se o build já o empacota.

Estrutura prática:

```text
dashboard/
├── index.jsp
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── imagens...
```

O ZIP deve preservar essa estrutura, sem incluir a pasta externa `dist` como nível adicional quando o importador espera o `index.jsp` na raiz.

## 15. Estrutura de projeto recomendada

### 15.1. Dashboard simples

```text
meu-dashboard/
├── index.jsp
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── img/
└── README.md
```

### 15.2. Gadget com níveis

```text
meu-dashboard/
├── dashboard.xml
├── principal.jsp
├── detalhado.jsp
└── assets/
    ├── css/
    ├── js/
    └── img/
```

### 15.3. Tela AngularJS complexa

```text
html5Component/
├── index.jsp
├── main.html
├── app.js
├── assets/
└── popup/
    └── recurso/
        ├── recurso.tpl.html
        └── recurso.controller.js
```

## 16. Responsividade e interface

- Usar `meta viewport`.
- Evitar alturas fixas como `height: 650px` quando o componente ocupa iframe variável.
- Preferir `min-height`, flexbox/grid e `overflow: auto`.
- Cards devem quebrar linha em telas menores.
- Tabelas precisam de container com rolagem horizontal.
- Botões devem ser `<button type="button">`.
- Imagens devem ter `alt`.
- Não depender apenas de cor para indicar estado.
- Manter foco visível e navegação por teclado.
- Exibir estado de carregamento, vazio e erro.
- Não criar novamente o cabeçalho de tabela em cada atualização sem limpar o conteúdo anterior.

## 17. Desempenho

- Nunca buscar todas as colunas se apenas algumas serão exibidas.
- Filtrar e agregar no banco.
- Evitar uma consulta por linha; usar joins ou consultas em lote.
- Aplicar filtros antes de ordenar.
- Não executar a mesma consulta em `<snk:query>` e `executeQuery`.
- Em dashboards com vários cards, avaliar uma consulta consolidada.
- Debounce em filtros digitados.
- Bloquear chamadas concorrentes duplicadas.
- Destruir listeners/atalhos no descarte do controller AngularJS.
- Não chamar `refresh()` repetidamente dentro de loops.
- Paginar grades extensas.
- Manter SQL diferente por banco quando necessário.

## 18. Erros e antipadrões encontrados

O Codex deve reconhecer os exemplos como material de referência, não como código perfeito. Não repetir:

- `contentType` ISO-8859-1 com `pageEncoding` UTF-8;
- dois `DOCTYPE` no mesmo JSP;
- `SELECT *`;
- imports JSP sem uso;
- import `oracle.sql.*` em código que pode rodar em SQL Server;
- HTML com atributo duplicado;
- IDs HTML repetidos;
- classes como `class="card 1"`, cujo token numérico é pouco semântico;
- funções diferentes que abrem exatamente o mesmo nível sem parâmetros quando deveriam distinguir contexto;
- SQL montado por scriptlet;
- inserção de dados do banco por `innerHTML`;
- recursão de busca quando a API retorna `null`;
- condições lógicas sempre verdadeiras, como `x !== null || x !== undefined || x !== 0`; o correto geralmente usa `&&`;
- acesso a `self.txtCodBarra.split(...)` sem validar valor e formato;
- ausência de `.catch` em promessas de serviço;
- IDs fixos de gadget e ação sem constante/configuração;
- manipulação direta de `window.parent.document`, frágil e sujeita a restrições de origem;
- recriação manual do iframe do gadget sem necessidade;
- chave de licença embutida no código;
- logs excessivos em produção;
- uso de `var` em código novo quando `const`/`let` são suportados pelo navegador homologado;
- dependências internas carregadas em massa sem uso.

## 19. Checklist para publicação

### Código

- [ ] O entry point está na raiz esperada pelo importador.
- [ ] `<snk:load/>` está no `<head>`.
- [ ] Todos os assets próprios usam `${BASE_FOLDER}` ou caminhos relativos válidos.
- [ ] O encoding é UTF-8 de ponta a ponta.
- [ ] Não há imports, scripts ou estilos sem uso.
- [ ] Não há IDs duplicados.
- [ ] Não há segredos, sessões, licenças ou credenciais no código.

### SQL e parâmetros

- [ ] O banco alvo foi confirmado: Oracle ou SQL Server.
- [ ] Não existe sintaxe híbrida.
- [ ] Os parâmetros usam bind (`:PARAM` ou `?`).
- [ ] A ordem dos parâmetros de `executeQuery` corresponde aos placeholders.
- [ ] Os estados vazio, zero, `NULL` e lista sem seleção foram testados.
- [ ] O período inclui corretamente o dia final.
- [ ] A consulta foi testada com e sem filtros.
- [ ] O volume máximo foi considerado.

### Navegação

- [ ] IDs de nível e componente existem no XML.
- [ ] Argumentos têm nome e tipo compatíveis.
- [ ] IDs de recurso, gadget e ação foram validados no ambiente.
- [ ] O destino HTML5/Flex foi testado.

### Interface

- [ ] Há estados de carregamento, vazio e erro.
- [ ] O layout funciona dentro do iframe e em tela menor.
- [ ] A tabela possui rolagem quando necessário.
- [ ] Botões não disparam ações duplicadas.
- [ ] Conteúdo dinâmico é escapado.

### Empacotamento

- [ ] O ZIP contém os arquivos, e não uma pasta externa desnecessária.
- [ ] Não foram incluídos `node_modules`, fontes do projeto ou caches.
- [ ] O pacote foi testado após ser extraído.
- [ ] Os nomes dos arquivos respeitam maiúsculas/minúsculas.

## 20. Regras obrigatórias para o Codex

Ao desenvolver com este contexto, o Codex deve seguir estas instruções:

1. Antes de alterar um dashboard, identificar qual das três arquiteturas ele usa: JSP simples, XML + JSP ou AngularJS interno.
2. Preservar a arquitetura existente, salvo pedido explícito de migração.
3. Confirmar o banco alvo antes de gerar SQL dependente de dialeto.
4. Usar parâmetros vinculados e nunca concatenar entrada do usuário em SQL.
5. Usar `${BASE_FOLDER}` para arquivos do pacote.
6. Manter `<snk:load/>` no JSP que usa APIs nativas.
7. Não inventar IDs de nível, componente, recurso, entidade, gadget ou ação Java.
8. Não copiar IDs `448`, `165`, `166`, `115` ou quaisquer IDs dos exemplos para outro projeto.
9. Não copiar chaves de licença, `MGE_PARAMS`, sessão ou configurações internas do exemplo complexo.
10. Tratar APIs `sk-*`, `ServiceProxy` e caminhos `/mge` como internos e dependentes de versão.
11. Preferir JSP + JavaScript para dashboard de leitura; usar AngularJS interno apenas quando dynaform/dataset/CRUD integrado forem realmente necessários.
12. Não usar JDBC direto no JSP.
13. Não usar `SELECT *` em código de produção.
14. Escapar todo conteúdo dinâmico exibido.
15. Implementar tratamento de erro em consultas e promessas.
16. Não alterar regra de negócio durante refatoração visual ou de desempenho.
17. Manter consultas Oracle e SQL Server em variantes separadas quando houver diferenças.
18. Validar filtro final de período, listas vazias e parâmetros opcionais.
19. Ao entregar, informar arquivos alterados, suposições, banco alvo e testes executados.
20. Se uma API interna não estiver demonstrada no projeto nem documentada para a versão, não adivinhar o contrato: solicitar exemplo de requisição ou confirmação do ambiente.

## 21. Modelo-base recomendado para novos dashboards

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8" isELIgnored="false" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="${BASE_FOLDER}/assets/css/style.css">
    <snk:load/>
</head>
<body>
    <main class="dashboard">
        <section id="status" role="status">Carregando...</section>
        <section id="content" hidden></section>
    </main>

    <script>
    (function () {
        "use strict";

        const status = document.getElementById("status");
        const content = document.getElementById("content");

        let sql = "SELECT CODPARC, NOMEPARC FROM TGFPAR WHERE 1 = 1";
        const params = [];

        if ("${CODPARC}" !== "") {
            sql += " AND CODPARC = ?";
            params.push({ value: "${CODPARC}", type: "I" });
        }

        sql += " ORDER BY CODPARC";

        executeQuery(sql, params, function (json) {
            try {
                const rows = JSON.parse(json);
                status.textContent = rows.length
                    ? ""
                    : "Nenhum registro encontrado.";
                content.hidden = rows.length === 0;
                // Renderizar usando createElement/textContent.
            } catch (error) {
                console.error("Resposta inválida da consulta", error);
                status.textContent = "Não foi possível carregar os dados.";
            }
        }, function (error) {
            console.error("Erro na consulta", error);
            status.textContent = "Não foi possível carregar os dados.";
        });
    }());
    </script>
</body>
</html>
```

## 22. Conclusão

O mecanismo mais estável demonstrado pelos projetos é o componente JSP com taglib Sankhya, `<snk:load/>`, parâmetros do dashboard e consultas vinculadas. O XML complementa esse padrão ao organizar filtros, níveis, componentes e gráficos nativos. A aplicação AngularJS com `sk-*`, dynaform e `ServiceProxy` amplia muito as possibilidades, mas também aumenta o acoplamento à versão e ao ambiente.

Para novas entregas, a decisão deve ser orientada pela menor complexidade capaz de atender ao requisito:

- consulta e visualização: JSP + HTML/CSS/JavaScript;
- navegação e composição: XML + componentes JSP;
- operação integrada com entidades, datasets e ações: AngularJS interno, validado na versão instalada;
- interface moderna compilada: React/Vite como assets estáticos, mantendo um entry point compatível com o contexto Sankhya.

Este documento descreve padrões comprovados pelos projetos fornecidos. APIs internas e contratos não demonstrados devem ser validados no ambiente antes de serem incorporados ao código.
