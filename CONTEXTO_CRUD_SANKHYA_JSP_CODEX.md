# Contexto completo — CRUD nativo Sankhya em JSP

## Objetivo deste documento

Este arquivo deve ser usado como contexto para o Codex entender como uma página HTML5 personalizada dentro do Sankhya conseguiu:

- carregar corretamente o framework nativo do Sankhya;
- identificar o usuário da sessão;
- consultar uma entidade adicional;
- inserir ou atualizar dados;
- evitar a tela completamente em branco;
- manter HTML, CSS e JavaScript em um único arquivo JSP;
- servir de referência para corrigir outro projeto que não está carregando ou não está gravando.

O arquivo funcional usado como referência é:

```text
index_teste_nome.jsp
```

A entidade utilizada no teste foi:

```text
AD_NOMETEST
```

Campos utilizados:

```text
CODUSU — identificador numérico do registro
NOME    — nome digitado pelo usuário
```

O teste funcionou dentro do Sankhya. Portanto, esse JSP deve ser tratado como uma **referência de ouro**. Ao corrigir o projeto principal, preserve primeiro o mesmo padrão de inicialização e somente depois faça refatorações.

---

## 1. Resultado comprovado

O fluxo funcional é:

1. O Sankhya processa o arquivo como JSP.
2. O JSP recupera os dados da sessão do usuário logado.
3. As bibliotecas nativas do Sankhya e o AngularJS são carregados.
4. O módulo AngularJS é criado com a dependência `snk`.
5. O `ServiceProxy` é disponibilizado por injeção de dependência.
6. O botão **Buscar por ID** chama `mge@crud.find`.
7. O botão **Salvar nome** chama `mge@crud.save`.
8. O registro é consultado e salvo na entidade `AD_NOMETEST`.

O teste confirmou que é possível manipular dados sem escrever SQL diretamente no frontend.

---

## 2. Regra principal: não é um HTML comum

O arquivo precisa ser executado dentro do Sankhya como JSP. Apenas renomear um HTML para `.jsp` não é suficiente.

Estas APIs não existem em uma página web comum:

```javascript
ServiceProxy
Criteria
ObjectUtils
MessageUtils
SkI18nService
SkWorkspace
SkApplicationInstance
```

Estas tags também dependem do framework Sankhya:

```html
<sk-dynaform></sk-dynaform>
<sk-dataset></sk-dataset>
<sk-pesquisa-input></sk-pesquisa-input>
<sk-datagrid></sk-datagrid>
```

O framework precisa ser carregado e inicializado antes que esses recursos funcionem.

---

## 3. Estrutura que funcionou

O teste foi construído em um único arquivo:

```text
index_teste_nome.jsp
├── diretivas JSP
├── imports Java
├── taglib Sankhya
├── HTML
├── CSS
├── scripts nativos
├── módulo AngularJS
├── consulta com crud.find
├── gravação com crud.save
└── inicialização com launcher.js
```

Essa estrutura em um único arquivo foi escolhida para eliminar dúvidas sobre:

- caminho incorreto de `app.js`;
- `${BASE_FOLDER}` incorreto;
- ordem dos scripts;
- arquivo JavaScript não encontrado;
- build com assets em diretórios diferentes;
- controller carregado antes das dependências.

Depois que o fluxo estiver funcionando no projeto principal, o código pode ser separado novamente.

---

## 4. Diretivas obrigatórias no início do JSP

O JSP funcional começa com:

```jsp
<%@ page language="java"
         contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"
         isELIgnored="false" %>

<%@ page import="br.com.sankhya.modelcore.profile.ApplicationProfileManager" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>
<%@ page import="br.com.sankhya.mge.core.services.AdministracaoServidorSP" %>
<%@ taglib uri="/WEB-INF/tld/sankhyaUtil.tld" prefix="snk" %>
```

Finalidade de cada item:

| Item | Finalidade |
|---|---|
| `contentType` | Entrega a página em UTF-8 |
| `pageEncoding` | Processa o JSP em UTF-8 |
| `AuthenticationInfo` | Recupera o usuário logado |
| `ApplicationProfileManager` | Recupera informações do perfil Sankhya |
| `AdministracaoServidorSP` | Recupera informações da aplicação |
| `sankhyaUtil.tld` | Disponibiliza tags JSP do Sankhya |

Não remover esses imports durante a correção sem confirmar que realmente não são utilizados.

---

## 5. Carregamento da tag Sankhya

Dentro do `<head>`, depois das variáveis esperadas pelo ambiente, foi usado:

```jsp
<snk:load/>
```

Essa tag faz parte do bootstrap nativo da tela HTML5 do Sankhya.

Não mover ou remover essa tag de forma arbitrária.

---

## 6. Recuperação da sessão do usuário

O JSP funcional expõe os dados da sessão para o JavaScript:

```jsp
<script>
    var UID =
        '<%= ((AuthenticationInfo) session.getAttribute("usuarioLogado"))
            .getUserID().toString() %>';

    var MGESESSION = '<%= request.getSession().getId() %>';

    var USERMAIL =
        '<%= ((AuthenticationInfo) session.getAttribute("usuarioLogado"))
            .getEmail() %>';

    var NOMEUSU =
        '<%= ((AuthenticationInfo) session.getAttribute("usuarioLogado"))
            .getName() %>';
</script>
```

Depois do processamento no servidor, essas variáveis ficam disponíveis no JavaScript:

```javascript
console.log(UID);
console.log(NOMEUSU);
```

No teste, `CODUSU` é o identificador do registro informado na tela. Ele pode ser preenchido manualmente ou, se a regra desejada for sempre utilizar o usuário logado, pode receber `UID`:

```javascript
self.form.codUsu = Number(UID);
```

Não confundir:

- `UID`: código do usuário logado na sessão;
- `CODUSU`: campo da entidade `AD_NOMETEST`;
- `NOMEUSU`: nome do usuário logado;
- `NOME`: valor armazenado na entidade de teste.

---

## 7. Variáveis esperadas pelo framework

O JSP funcional manteve as variáveis presentes no componente original:

```javascript
var VSS = '2';
var MGE_PARAMS = Base64.encode('...parâmetros do ambiente...');
var RAS = Base64.encode(
    'A=true;C=true;D=true;E=true;F=true;G=true;I=true;N=true'
);
var PCSF = '';
var appProfile = 'sankhya';
var locale = 'pt_BR';
var APPLICATION_NAME = '...';
var MODULE_ID = 'App';
var PROFILEID = '...';
var printerAppPort = 9096;
var printerAppSSLPort = 9196;
var i18nlocal = null;
var i18nAll = {};
var i18nFramework = {};
```

No arquivo real, `appProfile`, `APPLICATION_NAME` e `PROFILEID` são preenchidos por expressões JSP.

Ao corrigir o projeto principal, copiar o bloco completo do JSP funcional. Não criar uma versão resumida durante a investigação, pois uma diferença no ambiente pode interromper a inicialização.

---

## 8. Ordem dos scripts

A ordem é importante.

### 8.1 Scripts iniciais

Antes da configuração do ambiente:

```html
<script src="/mge/js/sf/sf.js"></script>
<script src="/mge/js/util/Base64.js"></script>
<script src="/mge/js/AppletCaller.js"></script>
<script src="/mge/js/html2canvas/html2canvas.min.js"></script>
<script src="/mge/js/impressao.js"></script>
```

`Base64.js` deve ser carregado antes de executar:

```javascript
Base64.encode(...)
```

### 8.2 AngularJS e dependências

Depois do HTML principal:

```html
<script src="/mge/js/util/jquery-1.9.1.min.js"></script>
<script src="/mge/scripts/custom-native-functions.js"></script>
<script src="/mge/scripts/vendors/angular/angular.js"></script>
<script src="/mge/scripts/vendors/angular/angular-touch.js"></script>
<script src="/mge/scripts/vendors/angular/angular-animate.min.js"></script>
<script src="/mge/scripts/vendors/angular/angular-aria.min.js"></script>
<script src="/mge/scripts/vendors/angular/angular-sanitize.min.js"></script>
<script src="/mge/scripts/vendors/angular/i18n/angular-locale_pt-br.js"></script>
<script src="/mge/scripts/vendors/ui-bootstrap/ui-bootstrap-tpls.min.js"></script>
<script src="/mge/scripts/vendors/ui-grid/ui-grid.modified.js"></script>
<script src="/mge/scripts/vendors/numeral/numeral.min.js"></script>
<script src="/mge/scripts/vendors/moment/moment.min.js"></script>
<script src="/mge/scripts/vendors/loading-bar/loading-bar.min.js"></script>
<script src="/mge/scripts/vendors/translate/angular-translate.js"></script>
<script src="/mge/scripts/vendors/sortable/sortable.min.js"></script>
<script src="/mge/scripts/vendors/ui-mask/mask.min.js"></script>
<script src="/mge/scripts/vendors/tinymce/tinymce.min.js"></script>
<script src="/mge/scripts/vendors/tinymce/uitinymce.js"></script>
<script src="/mge/scripts/vendors/tinymce/langs/pt_BR.js"></script>
<script src="/mge/scripts/vendors/tinymce/langs/en_CA.js"></script>
<script src="/mge/scripts/vendors/ace/ace.min.js"></script>
<script src="/mge/scripts/vendors/clipboard/clipboard.min.js"></script>
<script src="/mge/scripts/vendors/ag-grid/ag-grid-enterprise.js"></script>
<script src="/mge/scripts/vendors/bpmn/bpmn-custom-modeler.development.js"></script>
```

### 8.3 JQWidgets e módulo Sankhya

```html
<script src="/mge/js/jqwidgets/jqxcore.js"></script>
<script src="/mge/js/jqwidgets/jqxdata.js"></script>
<script src="/mge/js/jqwidgets/jqxlistbox.js"></script>
<script src="/mge/js/jqwidgets/jqxbuttons.js"></script>
<script src="/mge/js/jqwidgets/jqxscrollbar.js"></script>
<script src="/mge/js/jqwidgets/jqxmenu.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.selection.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.columnsresize.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.columnsreorder.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.sort.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.filter.js"></script>
<script src="/mge/js/jqwidgets/jqxgrid.aggregates.js"></script>
<script src="/mge/js/jqwidgets/jqxdropdownlist.js"></script>
<script src="/mge/scripts/snk.js?v=1"></script>
```

O controller deve ser declarado somente depois de `angular.js` e `snk.js` estarem disponíveis.

---

## 9. Inicialização do AngularJS

O módulo funcional foi criado assim:

```javascript
var ngAppName = 'app';

angular
    .module(ngAppName, ['snk'])
    .controller('TesteNomeController', [
        'ServiceProxy',
        function (ServiceProxy) {
            // Funções da tela
        }
    ]);
```

Pontos essenciais:

1. O módulo é `app`.
2. O módulo declara `['snk']` como dependência.
3. O `ServiceProxy` é injetado pelo AngularJS.
4. Não existe `import ServiceProxy from ...`.
5. Não usar `require()` para carregar o `ServiceProxy`.

O controller é associado ao HTML:

```html
<body ng-controller="TesteNomeController as ctrl">
```

---

## 10. Inicialização com o launcher do Sankhya

O JSP declara uma função global:

```javascript
window.startApplication = function () {
    angular.bootstrap(document, [ngAppName]);
};
```

Depois carrega:

```html
<script src="/mge/scripts/launcher.js?v="></script>
```

O `launcher.js` utiliza `startApplication()` para inicializar a aplicação no ambiente Sankhya.

Não carregar o launcher antes de declarar:

```javascript
window.startApplication
```

---

## 11. Por que a primeira versão ficou em branco

A primeira versão aplicava:

```html
<body ng-cloak>
```

O `ng-cloak` esconde o elemento até o AngularJS terminar o bootstrap. Como alguma dependência nativa não havia sido carregada e o bootstrap não terminou, todo o `<body>` continuou oculto.

Resultado:

```text
Página carregada + Angular com erro + ng-cloak no body = tela totalmente vazia
```

A correção foi:

1. remover `ng-cloak` do `<body>` inteiro;
2. carregar todas as dependências presentes no JSP original;
3. declarar `ngAppName` globalmente;
4. inicializar o ag-Grid como no componente original;
5. manter `startApplication()` global;
6. carregar o `launcher.js` por último.

Regra para o projeto principal:

> Durante o diagnóstico, nunca colocar `ng-cloak` no contêiner que envolve toda a página. Caso o Angular falhe, isso esconde inclusive a mensagem ou o formulário que ajudaria a identificar o erro.

Para evitar a exibição temporária de `{{ expressões }}`, utilizar `ng-bind`:

```html
<span ng-bind="ctrl.mensagem"></span>
```

Com fallback estático:

```html
<span ng-bind="ctrl.textoBotao">Salvar</span>
```

---

## 12. Consulta que funcionou

A busca utiliza o serviço:

```text
mge@crud.find
```

Implementação:

```javascript
function buscar() {
    var codigo = Number(self.form.codUsu);

    if (!Number.isInteger(codigo) || codigo <= 0) {
        mostrarErro('Informe um CODUSU numérico válido.');
        return;
    }

    var requestBody = {
        entity: {
            name: 'AD_NOMETEST',
            literalCriteria: {
                expression: {
                    $: 'CODUSU = ' + codigo
                }
            },
            fields: {
                field: [
                    { name: 'CODUSU' },
                    { name: 'NOME' }
                ]
            }
        }
    };

    ServiceProxy.callService('mge@crud.find', requestBody)
        .then(function (result) {
            var responseBody = result && result.responseBody;
            var entidades = responseBody && responseBody.entidades;
            var registro = entidades && entidades.entidade;

            if (!registro) {
                self.form.nome = '';
                mostrarErro('Registro não encontrado.');
                return;
            }

            if (angular.isArray(registro)) {
                registro = registro[0];
            }

            self.form.nome = registro.NOME && registro.NOME.$
                ? String(registro.NOME.$)
                : '';
        });
}
```

### Estrutura da consulta

```javascript
{
    entity: {
        name: 'NOME_DA_ENTIDADE',
        literalCriteria: {
            expression: {
                $: 'FILTRO'
            }
        },
        fields: {
            field: [
                { name: 'CAMPO1' },
                { name: 'CAMPO2' }
            ]
        }
    }
}
```

### Formato do retorno

Os registros ficam normalmente em:

```javascript
result.responseBody.entidades.entidade
```

O Sankhya pode devolver:

- `null` ou `undefined`, quando não há resultado;
- um objeto, quando há somente um registro;
- um array, quando há vários registros.

Sempre normalizar o retorno antes de percorrer:

```javascript
if (registro && !angular.isArray(registro)) {
    registro = [registro];
}
```

---

## 13. Gravação que funcionou

A gravação utiliza:

```text
mge@crud.save
```

Implementação:

```javascript
function salvar() {
    var codigo = Number(self.form.codUsu);
    var nome = String(self.form.nome || '').trim();

    if (!Number.isInteger(codigo) || codigo <= 0) {
        mostrarErro('Informe um CODUSU válido.');
        return;
    }

    if (!nome) {
        mostrarErro('Digite um nome.');
        return;
    }

    var requestBody = {
        entity: {
            name: 'AD_NOMETEST',
            campo: [
                { nome: 'CODUSU', $: codigo },
                { nome: 'NOME', $: nome }
            ]
        }
    };

    ServiceProxy.callService('mge@crud.save', requestBody)
        .then(function (result) {
            if (!result || Number(result.status) !== 1) {
                throw new Error(
                    (result && result.statusMessage) ||
                    'O Sankhya não confirmou a gravação.'
                );
            }

            mostrarSucesso('Registro salvo com sucesso.');
        })
        .catch(function (error) {
            mostrarErro(
                error.statusMessage ||
                error.message ||
                'Erro ao salvar.'
            );
        });
}
```

### Estrutura da gravação

```javascript
{
    entity: {
        name: 'NOME_DA_ENTIDADE',
        campo: [
            { nome: 'CAMPO1', $: valor1 },
            { nome: 'CAMPO2', $: valor2 }
        ]
    }
}
```

Pontos importantes:

- `name` é o nome da entidade reconhecida pelo Sankhya;
- `nome` é o nome do campo;
- `$` contém o valor do campo;
- `status === 1` representa sucesso no fluxo testado;
- `statusMessage` deve ser exibido quando houver erro.

---

## 14. Entidade não é necessariamente tabela física

O frontend utiliza:

```javascript
name: 'AD_NOMETEST'
```

Esse valor precisa ser reconhecido pelo CRUD do Sankhya como entidade.

Não basta existir apenas:

```sql
CREATE TABLE AD_NOMETEST (...)
```

A tabela adicional precisa estar corretamente cadastrada no dicionário de dados/metadados do Sankhya, com:

- nome da entidade;
- campos;
- tipos;
- chave primária;
- permissões de acesso;
- configuração de inclusão e alteração.

No teste, foi assumido:

```text
Entidade: AD_NOMETEST
Chave:    CODUSU
Campo:    NOME
```

Se o nome interno da entidade for diferente do nome físico da tabela, utilizar o nome da entidade esperado pelo CRUD.

---

## 15. Inserção e atualização

O mesmo `crud.save` pode inserir ou atualizar conforme:

- chave primária enviada;
- existência do registro;
- metadados da entidade;
- regras internas do Sankhya.

No teste, o payload envia `CODUSU` e `NOME`:

```javascript
campo: [
    { nome: 'CODUSU', $: codigo },
    { nome: 'NOME', $: nome }
]
```

Se `CODUSU` for a chave da entidade:

- chave inexistente: tendência de inclusão;
- chave existente: tendência de alteração;
- comportamento final: determinado pelo CRUD e metadados da entidade.

Não remover a chave do payload ao tentar atualizar um registro existente.

---

## 16. Diferença entre o teste funcional e um projeto React/Vite

O projeto principal utiliza React/Vite e gera JavaScript puro no build. Isso não torna automaticamente disponíveis os serviços nativos do Sankhya.

### JSP/AngularJS nativo

```text
JSP carrega snk.js
       ↓
AngularJS cria o módulo com ['snk']
       ↓
ServiceProxy é injetado
       ↓
crud.find / crud.save funcionam
```

### React/Vite sozinho

```text
React inicia
       ↓
ServiceProxy não foi importado nem injetado
       ↓
chamada nativa não existe ou ocorre cedo demais
```

React não utiliza a injeção de dependência do AngularJS. Portanto, não é correto copiar diretamente isto para um componente React:

```javascript
function Componente(ServiceProxy) {
    // Isso não injeta o serviço do Sankhya no React.
}
```

Também não existe necessariamente um pacote NPM oficial correspondente a:

```javascript
import ServiceProxy from 'sankhya';
```

### Estratégias possíveis

#### Estratégia A — manter a integração nativa no JSP

O JSP inicializa o AngularJS/Sankhya e expõe funções controladas para o frontend.

Exemplo conceitual:

```javascript
angular.module('app', ['snk']).run([
    'ServiceProxy',
    function (ServiceProxy) {
        window.SankhyaService = {
            consultar: function (requestBody) {
                return ServiceProxy.callService(
                    'mge@crud.find',
                    requestBody
                );
            },
            salvar: function (requestBody) {
                return ServiceProxy.callService(
                    'mge@crud.save',
                    requestBody
                );
            }
        };

        window.dispatchEvent(new Event('sankhya-ready'));
    }
]);
```

O React somente chama a ponte depois que ela estiver pronta:

```javascript
window.addEventListener('sankhya-ready', function () {
    // Inicializar operações que dependem do Sankhya.
});
```

Essa estratégia precisa ser implementada com cuidado para não inicializar AngularJS e React sobre o mesmo nó do DOM.

#### Estratégia B — manter o módulo CRUD fora dos componentes React

Criar uma camada, por exemplo:

```text
src/
├── services/
│   └── sankhyaService.js
├── components/
└── pages/
```

Os componentes React chamam apenas funções da camada de serviço. A implementação nativa continua centralizada.

Não espalhar chamadas como esta por vários componentes:

```javascript
ServiceProxy.callService(...)
```

---

## 17. Possíveis motivos para o projeto principal não funcionar

Ao analisar o projeto principal, verificar nesta ordem:

### 17.1 O arquivo está realmente sendo processado como JSP?

Se o navegador receber literalmente:

```jsp
<%= request.getSession().getId() %>
```

o arquivo não foi processado pelo servidor JSP.

### 17.2 A sessão contém `usuarioLogado`?

Verificar se isto retorna valor:

```jsp
session.getAttribute("usuarioLogado")
```

### 17.3 `Base64.js` foi carregado antes de `Base64.encode()`?

Caso contrário:

```text
Base64 is not defined
```

### 17.4 `angular.js` foi carregado?

Caso contrário:

```text
angular is not defined
```

### 17.5 `snk.js` foi carregado antes de criar o módulo?

Caso contrário, o Angular não encontrará:

```javascript
['snk']
```

### 17.6 Todas as dependências esperadas pelo `snk` estão presentes?

Uma dependência ausente pode interromper todo o injector AngularJS.

### 17.7 O nome do módulo é consistente?

Estes nomes precisam coincidir:

```javascript
var ngAppName = 'app';
angular.module(ngAppName, ['snk']);
angular.bootstrap(document, [ngAppName]);
```

### 17.8 `startApplication()` existe antes do launcher?

```javascript
window.startApplication = function () { ... };
```

deve existir antes de:

```html
<script src="/mge/scripts/launcher.js?v="></script>
```

### 17.9 O `ng-cloak` está escondendo a aplicação inteira?

Durante o diagnóstico, remover:

```html
<body ng-cloak>
```

### 17.10 O build do React substituiu ou removeu o bootstrap nativo?

O arquivo gerado pelo Vite não substitui:

- imports do JSP;
- sessão;
- `snk:load`;
- `snk.js`;
- criação do módulo AngularJS;
- injeção do `ServiceProxy`;
- `launcher.js`.

### 17.11 O script do build está sendo carregado no caminho correto?

Confirmar pelo console e aba Network:

```html
<script src="${BASE_FOLDER}/assets/index.js"></script>
```

O nome real pode conter hash:

```text
assets/index-CODIGO.js
```

### 17.12 A entidade existe no CRUD?

Se `AD_NOMETEST` não for uma entidade válida para o CRUD, a tela pode carregar, mas a consulta/gravação falhará.

### 17.13 O usuário possui permissão?

A sessão utilizada é a do usuário logado. O CRUD respeita regras e permissões do ambiente.

### 17.14 O campo e o tipo estão corretos?

Validar:

```text
CODUSU — número
NOME    — texto
```

---

## 18. Logs mínimos para diagnóstico

Adicionar temporariamente:

```javascript
console.log('[BOOT] JSP carregado');
console.log('[BOOT] UID:', UID);
console.log('[BOOT] Angular:', typeof angular);
console.log('[BOOT] Módulo snk será inicializado');
```

No início do controller:

```javascript
console.log('[ANGULAR] Controller iniciado');
console.log('[ANGULAR] ServiceProxy:', ServiceProxy);
```

Antes da consulta:

```javascript
console.log('[CRUD FIND] Request:', requestBody);
```

Depois da consulta:

```javascript
console.log('[CRUD FIND] Response:', result);
```

Antes da gravação:

```javascript
console.log('[CRUD SAVE] Request:', requestBody);
```

Depois da gravação:

```javascript
console.log('[CRUD SAVE] Response:', result);
```

Não registrar senhas, tokens, cookies ou conteúdo sensível.

---

## 19. Checklist de comparação com o JSP funcional

Antes de alterar regras de negócio, comparar:

- [ ] Extensão final é `.jsp`.
- [ ] Diretiva JSP está no início.
- [ ] `AuthenticationInfo` está importado.
- [ ] Taglib `snk` está declarada.
- [ ] `<snk:load/>` está presente.
- [ ] `Base64.js` vem antes de `Base64.encode()`.
- [ ] `UID` e `MGESESSION` são preenchidos.
- [ ] AngularJS está carregado.
- [ ] Dependências do componente original foram preservadas.
- [ ] `snk.js` está carregado.
- [ ] Módulo foi criado com `['snk']`.
- [ ] `ServiceProxy` está no array de injeção.
- [ ] Nome e ordem das dependências correspondem aos argumentos da função.
- [ ] `ngAppName` é igual em todos os pontos.
- [ ] `startApplication()` está global.
- [ ] `launcher.js` é o último passo do bootstrap.
- [ ] `ng-cloak` não esconde toda a página.
- [ ] Entidade está cadastrada no Sankhya.
- [ ] Chave primária está correta.
- [ ] Usuário possui permissão.
- [ ] `crud.find` recebe o nome correto da entidade.
- [ ] `crud.save` envia chave e campos necessários.
- [ ] `status` e `statusMessage` são tratados.

---

## 20. Regras para o Codex ao corrigir o projeto principal

O Codex deve seguir estas regras:

1. Usar `index_teste_nome.jsp` como referência funcional.
2. Não substituir a integração nativa por API fictícia.
3. Não inventar imports NPM para `ServiceProxy`.
4. Não remover scripts nativos durante o diagnóstico.
5. Não mudar simultaneamente bootstrap, CRUD e interface.
6. Primeiro fazer a tela carregar.
7. Depois confirmar que o controller foi iniciado.
8. Depois confirmar que `ServiceProxy` foi injetado.
9. Depois testar `crud.find`.
10. Por último testar `crud.save`.
11. Preservar mudanças existentes não relacionadas.
12. Informar exatamente quais arquivos foram alterados.
13. Adicionar logs temporários em cada etapa.
14. Não considerar concluído sem verificar o retorno do serviço.
15. Se React estiver presente, separar o nó montado pelo React do nó usado pelo AngularJS.
16. Não inicializar duas aplicações AngularJS sobre o mesmo documento.
17. Não executar chamadas antes do evento de inicialização do Sankhya.
18. Não usar SQL concatenado quando houver alternativa segura.
19. Tratar retorno único e retorno em array.
20. Exibir `statusMessage` recebido do Sankhya.

---

## 21. Plano recomendado para corrigir o projeto atual

### Etapa 1 — localizar o ponto de entrada

Identificar:

```text
index.jsp
index.html
main.jsx
main.tsx
App.jsx
vite.config.js
dist/
```

### Etapa 2 — comparar o JSP

Comparar o `index.jsp` atual com `index_teste_nome.jsp`, principalmente:

- imports;
- taglibs;
- variáveis globais;
- scripts;
- ordem dos scripts;
- módulo AngularJS;
- launcher.

### Etapa 3 — provar o bootstrap

Adicionar uma mensagem visível e logs, sem `ng-cloak` no body.

### Etapa 4 — provar o ServiceProxy

Criar uma consulta simples e controlada para `AD_NOMETEST`.

### Etapa 5 — provar a gravação

Reutilizar exatamente o payload funcional de `crud.save`.

### Etapa 6 — integrar com a tela real

Somente depois de consulta e gravação funcionarem, conectar a camada nativa aos componentes reais.

### Etapa 7 — remover logs de diagnóstico

Manter apenas tratamento de erro útil ao usuário.

---

## 22. Prompt pronto para entregar ao Codex

```text
Analise este projeto Sankhya e corrija a integração de consulta e gravação.

Use o arquivo index_teste_nome.jsp como referência funcional obrigatória. Esse
arquivo já foi executado dentro do Sankhya e comprovadamente consulta e salva na
entidade AD_NOMETEST usando mge@crud.find e mge@crud.save.

Leia primeiro o arquivo CONTEXTO_CRUD_SANKHYA_JSP_CODEX.md inteiro. Depois:

1. Localize o index.jsp, a entrada do React/Vite e os arquivos gerados no build.
2. Compare o bootstrap atual com index_teste_nome.jsp.
3. Preserve os imports JSP, a taglib snk, <snk:load/>, as variáveis da sessão,
   os scripts nativos, o módulo AngularJS com dependência ['snk'], a função
   startApplication e o launcher.js.
4. Não invente import NPM para ServiceProxy.
5. Não remova dependências enquanto estiver diagnosticando.
6. Garanta primeiro que o conteúdo carregue sem ng-cloak escondendo o body.
7. Confirme por logs que o controller iniciou e ServiceProxy foi injetado.
8. Centralize crud.find e crud.save em uma camada de serviço.
9. Se React estiver presente, não monte React e AngularJS sobre o mesmo nó.
10. Use uma ponte explícita e aguarde o Sankhya estar pronto antes das chamadas.
11. Preserve todas as alterações existentes não relacionadas.
12. Ao terminar, informe a causa exata, os arquivos alterados e como testar.

Não faça apenas uma explicação: implemente a correção e valide o fluxo em etapas.
```

---

## 23. Referência final das chamadas

### Buscar

```javascript
ServiceProxy.callService('mge@crud.find', {
    entity: {
        name: 'AD_NOMETEST',
        literalCriteria: {
            expression: {
                $: 'CODUSU = ' + Number(codUsu)
            }
        },
        fields: {
            field: [
                { name: 'CODUSU' },
                { name: 'NOME' }
            ]
        }
    }
});
```

### Salvar

```javascript
ServiceProxy.callService('mge@crud.save', {
    entity: {
        name: 'AD_NOMETEST',
        campo: [
            { nome: 'CODUSU', $: Number(codUsu) },
            { nome: 'NOME', $: String(nome).trim() }
        ]
    }
});
```

---

## 24. Conclusão

O teste comprovou que a consulta e a gravação funcionam quando o frontend está inserido corretamente no ciclo de vida nativo do Sankhya.

O ponto decisivo não foi apenas a sintaxe de `crud.find` ou `crud.save`. O funcionamento depende do conjunto completo:

```text
JSP processado pelo Sankhya
+ sessão válida
+ imports e taglibs
+ scripts na ordem correta
+ módulo AngularJS com snk
+ ServiceProxy injetado
+ startApplication
+ launcher.js
+ entidade cadastrada
+ payload correto
= consulta e gravação funcionando
```

Qualquer correção do projeto principal deve começar pela comparação desse ciclo completo com o JSP funcional.

