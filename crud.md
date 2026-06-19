# Sintaxe para consulta e manipulação de dados no Sankhya

Este guia foi extraído do componente `448_html5Component` e documenta os padrões usados pelo frontend JavaScript/AngularJS para consultar e gravar dados por meio dos serviços nativos do Sankhya.

## 0. Pré-requisito: carregar o framework Sankhya no `index.jsp`

As chamadas documentadas neste guia **não funcionam em um HTML ou JavaScript isolado**. O `ServiceProxy`, o `Criteria`, o `ObjectUtils`, os datasets e as tags `sk-*` são fornecidos pelo framework HTML5/AngularJS do Sankhya.

O projeto precisa manter esta divisão:

```text
index.jsp  -> importa classes, taglibs, estilos, scripts e dados da sessão
main.html  -> contém as tags Sankhya, como sk-dynaform e sk-dataset
app.js     -> cria o módulo AngularJS e recebe os serviços por injeção
```

### 0.1 Imports e taglibs do JSP

O componente analisado começa com estes imports:

```jsp
<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" isELIgnored="false" %>

<%@ page import="java.util.*" %>
<%@ page import="java.sql.*" %>
<%@ page import="oracle.sql.*" %>
<%@ page import="java.io.*" %>

<%@ page import="br.com.sankhya.modelcore.profile.ApplicationProfileManager" %>
<%@ page import="br.com.sankhya.modelcore.auth.AuthenticationInfo" %>
<%@ page import="br.com.sankhya.modelcore.util.MGECoreParameter" %>
<%@ page import="br.com.sankhya.mge.core.services.AdministracaoServidorSP" %>

<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib uri="/WEB-INF/tld/sankhyaUtil.tld" prefix="snk" %>
```

Nem todo projeto utilizará diretamente `java.sql`, `oracle.sql`, `java.io`, `MGECoreParameter`, `fmt` ou `fn`. Eles fazem parte do arquivo original, mas podem ser removidos caso estejam realmente sem uso. Para o bootstrap mostrado aqui, os imports centrais são `AuthenticationInfo`, `ApplicationProfileManager`, `AdministracaoServidorSP` e a taglib `snk`.

### 0.2 Carregamento nativo com `snk:load`

Dentro do `<head>`, o projeto utiliza:

```jsp
<snk:load/>
```

Essa tag participa do carregamento do ambiente Sankhya. Ela não substitui todos os scripts explícitos usados por esse componente.

### 0.3 Estilos carregados pelo componente original

```html
<link rel="stylesheet" href="/mge/assets/vendors/ui-grid/ui-grid.min.css">
<link rel="stylesheet" href="/mge/assets/vendors/bootstrap.min.css">
<link rel="stylesheet" href="/mge/assets/vendors/loading-bar.min.css">
<link rel="stylesheet" href="/mge/js/jqwidgets/styles/jqx.base.css">
<link rel="stylesheet" href="/mge/js/jqwidgets/styles/jqx.metro.css">
<link rel="stylesheet" href="/mge/assets/css/snk.min.css">
```

Os estilos adicionais de BPMN presentes no projeto original somente são necessários caso a tela utilize esses componentes.

### 0.4 Scripts base carregados antes da configuração

O arquivo original carrega primeiro:

```html
<script src="/mge/js/sf/sf.js"></script>
<script src="/mge/js/util/Base64.js"></script>
<script src="/mge/js/AppletCaller.js"></script>
<script src="/mge/js/html2canvas/html2canvas.min.js"></script>
<script src="/mge/js/impressao.js"></script>
```

`Base64.js` é necessário no exemplo porque `MGE_PARAMS` e parâmetros do gadget são codificados com `Base64.encode()`.

### 0.5 Variáveis de sessão e configuração

Antes de inicializar o AngularJS, o JSP original define variáveis globais esperadas pelo ambiente:

```jsp
<script>
  var VSS = '2';
  var MGE_PARAMS = Base64.encode('PARAMETROS_DO_AMBIENTE');
  var RAS = Base64.encode(
    'A=true;C=true;D=true;E=true;F=true;G=true;I=true;N=true'
  );
  var PCSF = '';

  var appProfile =
    '<%= ApplicationProfileManager.getInstance().isJivaW()
      ? "jiva"
      : "sankhya" %>';

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

  var locale = 'pt_BR';
  var APPLICATION_NAME = '<%= AdministracaoServidorSP.getTituloBrowser() %>';
  var MODULE_ID = 'App';
  var PROFILEID =
    '<%= ApplicationProfileManager.getInstance().getProfileId() %>';

  var printerAppPort = 9096;
  var printerAppSSLPort = 9196;
  var i18nlocal = null;
  var i18nAll = {};
  var i18nFramework = {};
</script>
```

Não substitua `MGE_PARAMS` simplesmente pelo texto `PARAMETROS_DO_AMBIENTE` em produção. O componente original utiliza a configuração completa fornecida pelo ambiente. Ao adaptar uma tela que já funciona, preserve esse bloco e altere apenas o que for necessário.

As informações do usuário logado ficam disponíveis no JavaScript, por exemplo:

```javascript
var codigoUsuarioLogado = UID;
var nomeUsuarioLogado = NOMEUSU;
```

### 0.6 AngularJS e bibliotecas Sankhya

Depois do conteúdo da página, o arquivo original carrega AngularJS, componentes visuais e o framework `snk.js`. O conjunto central é:

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

<script src="/mge/scripts/snk.js?v=1"></script>
```

O projeto original ainda importa JQWidgets, ag-Grid, máscara, TinyMCE, ACE, Clipboard e BPMN. Esses arquivos devem ser mantidos se os respectivos componentes forem usados. Para copiar fielmente a tela original, preserve todos os imports e a ordem existente no `index.jsp`.

### 0.7 Carregar o controller somente depois das dependências

O `app.js` deve ser carregado depois do AngularJS e do `snk.js`:

```jsp
<script src="${BASE_FOLDER}/app.js"></script>
```

Os controllers dos pop-ups também são carregados depois:

```jsp
<script src="${BASE_FOLDER}/popup/informarCodigoRastreio.controller.js"></script>
<script src="${BASE_FOLDER}/popup/MotivoParada/motivoParadaPopUp.controller.js"></script>
<script src="${BASE_FOLDER}/popup/AlterarCT/alterarctPopUp.controller.js"></script>
<script src="${BASE_FOLDER}/popup/SelecaoRecursos/SelecaoRecursosPopUp.controller.js"></script>
```

### 0.8 Declarar o módulo com a dependência `snk`

No `app.js`, o módulo precisa incluir `snk`:

```javascript
angular
  .module('app', ['snk'])
  .controller('AppController', [
    'Criteria',
    'ObjectUtils',
    'MessageUtils',
    'ServiceProxy',
    'SkApplicationInstance',
    function (
      Criteria,
      ObjectUtils,
      MessageUtils,
      ServiceProxy,
      SkApplicationInstance
    ) {
      // O ServiceProxy já pode ser utilizado aqui.
    }
  ]);
```

Não existe um `import ServiceProxy from ...`. O `ServiceProxy` é registrado pelo módulo `snk` e entregue ao controller pela injeção de dependência do AngularJS.

### 0.9 Inicializar manualmente a aplicação

O componente analisado configura idioma, workspace e inicia o AngularJS manualmente:

```javascript
var ngAppName = 'app';

angular.module(ngAppName).run(function (SkI18nService, SkWorkspace) {
  SkWorkspace.unlockSwitchApp();
  SkI18nService.setLang(locale);
});

function startApplication() {
  angular.bootstrap(document, [ngAppName]);
}
```

No final, o JSP carrega o launcher nativo:

```html
<script src="/mge/scripts/launcher.js?v="></script>
```

O `launcher.js` utiliza a função `startApplication()` para iniciar a tela dentro do ambiente Sankhya.

### 0.10 Onde entram as tags `sk-*`

Depois desse bootstrap, o `main.html` pode utilizar componentes como:

```html
<sk-dynaform
  sk-entity-name="AD_TABAPO"
  sk-on-dynaform-loaded="ctrl.onDynaformLoaded(dynaform, dataset)">
</sk-dynaform>

<sk-dataset
  entity-name="AD_SELECAO"
  sk-dataset-created="ctrl.onDatasetCreated(fieldName, dataset)">
</sk-dataset>
```

Sem o módulo `snk`, seus scripts e o bootstrap do aplicativo, o navegador tratará essas tags apenas como elementos HTML desconhecidos e nenhum dataset será criado.

## 1. Dependência necessária

Depois que o JSP carregar e inicializar o framework, o controller precisa receber o `ServiceProxy` por injeção de dependência:

```javascript
angular.module('app', ['snk'])
  .controller('AppController', [
    'ServiceProxy',
    'ObjectUtils',
    function (ServiceProxy, ObjectUtils) {
      // Funções de consulta e gravação
    }
  ]);
```

O `ServiceProxy.callService()` envia a requisição ao backend do Sankhya usando a sessão do usuário logado.

> Os nomes informados em `entity.name` e `entityName` normalmente são nomes de entidades cadastradas no Sankhya, e não necessariamente os nomes físicos das tabelas no Oracle.

## 2. Consultar registros com `mge@crud.find`

Use esse serviço para buscar campos de uma entidade.

### Estrutura básica

```javascript
function buscarUsuario(codUsu) {
  var requestBody = {
    entity: {
      name: 'Usuario',
      literalCriteria: {
        expression: {
          $: 'CODUSU = ' + Number(codUsu)
        }
      },
      fields: {
        field: [
          { name: 'CODUSU' },
          { name: 'NOMEUSU' }
        ]
      }
    }
  };

  return ServiceProxy.callService('mge@crud.find', requestBody)
    .then(function (result) {
      var registros = result.responseBody.entidades.entidade;

      if (!registros) {
        return [];
      }

      if (!angular.isArray(registros)) {
        registros = [registros];
      }

      return registros.map(function (registro) {
        return {
          codigo: ObjectUtils.getProperty(registro, 'CODUSU.$'),
          nome: ObjectUtils.getProperty(registro, 'NOMEUSU.$')
        };
      });
    });
}
```

### Como funciona

- `name`: entidade que será consultada.
- `literalCriteria.expression.$`: filtro aplicado na consulta.
- `fields.field`: campos que devem retornar.
- `responseBody.entidades.entidade`: registros encontrados.
- Quando existe somente um resultado, o Sankhya pode devolver um objeto em vez de um array. Por isso, normalize o retorno antes de percorrê-lo.

### Exemplo com mais de uma condição

```javascript
var situacao = 'C';

var requestBody = {
  entity: {
    name: 'CabecalhoApontamento',
    literalCriteria: {
      expression: {
        $: 'IDIATV = ' + Number(idAtividade) +
           " AND SITUACAO != '" + situacao + "'"
      }
    },
    fields: {
      field: [
        { name: 'NUAPO' }
      ]
    }
  }
};

ServiceProxy.callService('mge@crud.find', requestBody)
  .then(function (result) {
    console.log(result.responseBody.entidades.entidade);
  });
```

### Cuidados com o filtro literal

O `literalCriteria` é montado como texto. Não concatene diretamente valores livres digitados pelo usuário. Para códigos numéricos, converta com `Number()` e valide antes:

```javascript
var codigo = Number(valorDigitado);

if (!Number.isInteger(codigo) || codigo <= 0) {
  throw new Error('Código inválido.');
}
```

## 3. Inserir ou salvar um registro com `mge@crud.save`

Use esse padrão para gravar uma entidade por vez.

```javascript
function inserirRecurso(dados) {
  var requestBody = {
    entity: {
      name: 'ItensApontamentoRecursosWC',
      campo: [
        { nome: 'CODCRE', $: dados.codCre },
        { nome: 'CODRHP', $: dados.codRhp },
        { nome: 'CODMQP', $: dados.codMqp },
        { nome: 'CODWCP', $: dados.codWcp },
        { nome: 'NUAPO', $: dados.nuApo },
        { nome: 'SEQAPA', $: 1 }
      ]
    }
  };

  return ServiceProxy.callService('mge@crud.save', requestBody)
    .then(function (result) {
      if (result.status !== 1) {
        throw new Error(result.statusMessage || 'Não foi possível salvar.');
      }

      return result.responseBody;
    });
}
```

### Estrutura

- `entity.name`: nome da entidade que receberá o registro.
- `campo`: lista de campos e valores.
- `nome`: nome do campo da entidade.
- `$`: valor que será enviado.
- `status === 1`: operação concluída com sucesso.
- `statusMessage`: mensagem retornada em caso de erro.

Se a chave primária não for informada e for gerada pelo Sankhya, a operação normalmente cria um registro. Se uma chave existente for enviada, o comportamento depende da configuração da entidade e pode representar uma atualização.

## 4. Inserir vários registros com `mge@DatasetSP.save`

O componente utiliza esse serviço para inserir registros em lote na entidade `AD_TGMCAP`.

```javascript
async function inserirApontamentos(linhas) {
  var records = linhas.map(function (linha) {
    return {
      values: {
        '1': linha.seqcap,
        '2': linha.codigoBarra,
        '3': linha.atividade,
        '4': linha.maquina,
        '5': linha.usuario,
        '6': linha.idiproc,
        '7': linha.quantidade
      }
    };
  });

  var requestBody = {
    dataSetID: '00E',
    entityName: 'AD_TGMCAP',
    standAlone: false,
    fields: [
      'SEQCAP',
      'CODIGOBARRA',
      'ATIVIDADE',
      'MAQUINA',
      'USUARIO',
      'IDIPROC',
      'QTDE'
    ],
    records: records
  };

  return ServiceProxy.callService('mge@DatasetSP.save', requestBody);
}
```

### Regra mais importante

As posições dentro de `values` correspondem à ordem declarada em `fields`:

```text
1 -> SEQCAP
2 -> CODIGOBARRA
3 -> ATIVIDADE
4 -> MAQUINA
5 -> USUARIO
6 -> IDIPROC
7 -> QTDE
```

Se a ordem estiver errada, um valor pode ser enviado ao campo incorreto.

No arquivo analisado, o registro em lote é montado assim:

```javascript
var records = [];

records.push({
  values: {
    '1': row.CAMPOSTR,
    '2': row.ATIVIDADE,
    '3': row.MAQUINA,
    '4': row.CODUSU,
    '5': row.NROOP,
    '6': row.QUANTIDADE
  }
});
```

Nesse caso específico, confira a correspondência com o array `fields`, porque o arquivo original declara sete campos, mas envia somente seis posições. Esse desalinhamento merece validação antes de reutilizar o código.

## 5. Executar uma ação Java cadastrada no Sankhya

Use `mge@ActionButtonsSP.executeJava` para executar uma Ação Java configurada no ERP.

```javascript
function executarAcaoJava(idAcao, linhas) {
  var rows = linhas.map(function (linha) {
    return {
      field: [
        { fieldName: 'IDIPROC', $: linha.idiproc },
        { fieldName: 'NUMLOTE', $: linha.numeroLote },
        { fieldName: 'NUAPO', $: linha.nuApo }
      ]
    };
  });

  var requestBody = {
    javaCall: {
      actionID: String(idAcao),
      refreshType: 'ALL',
      rows: {
        row: rows
      }
    }
  };

  return ServiceProxy.callService(
    'mge@ActionButtonsSP.executeJava',
    requestBody
  );
}
```

### Estrutura

- `actionID`: código da Ação Java cadastrada no Sankhya.
- `refreshType`: define como a tela será atualizada após a execução.
- `rows.row`: registros enviados para a ação.
- `fieldName`: nome do campo que a implementação Java espera receber.
- `$`: valor do campo.

O JavaScript apenas dispara a ação. Inserts, updates, deletes e validações executados internamente só podem ser confirmados analisando o código Java correspondente ao `actionID`.

## 6. Carregar uma entidade com `sk-dynaform`

O HTML pode criar um dataset automaticamente para uma entidade:

```html
<sk-dynaform
  sk-entity-name="AD_TABAPO"
  sk-on-dynaform-loaded="ctrl.onDynaformLoaded(dynaform, dataset)"
  sk-skip-start-page="true">
</sk-dynaform>
```

No controller:

```javascript
function onDynaformLoaded(dynaform, dataset) {
  self.myDS = dataset;
  self.myDS.setCanEdit(true);
  self.myDS.addCriteriaProvider(getCriteria);

  return self.myDS.initAndRefresh();
}
```

Um filtro parametrizado pode ser criado com `Criteria`:

```javascript
function getCriteria() {
  var codigo = Criteria.buildNumberParameter(self.nuApo);
  return new Criteria('NUAPO = ?', [codigo]);
}
```

Esse formato é preferível à concatenação de valores, quando a API do componente oferece suporte a `Criteria`.

## 7. Criar um dataset diretamente no HTML

```html
<sk-dataset
  entity-name="AD_SELECAO"
  sk-dataset-created="ctrl.onDatasetCreated(fieldName, dataset, fieldProp, scope)"
  sk-refresh-handler="ctrl.refreshHandler(request)">
</sk-dataset>
```

```javascript
function onDatasetCreated(fieldName, dataset) {
  self.myDS = dataset;
  return self.myDS.initializeDataSet().then(function () {
    return self.myDS.refresh();
  });
}
```

## 8. Inserir valores apenas em memória no dataset

Alguns pop-ups usam o modo de inserção antes de devolver o dataset para outra função:

```javascript
self.dsExecucaoAtividade.goToInsertionMode().then(function () {
  self.dsExecucaoAtividade.setFieldValue('CODMTP', codigoMotivo);
  self.dsExecucaoAtividade.setFieldValue('OBSERVACAO', observacao);
});
```

Isso prepara um novo registro no dataset, mas não comprova sozinho que houve gravação no banco. A persistência acontece somente quando o dataset é salvo ou quando outra ação recebe esses dados e realiza a gravação.

## 9. Modelo de funções reutilizáveis

```javascript
export function consultarEntidade(ServiceProxy, entidade, campos, criterio) {
  var requestBody = {
    entity: {
      name: entidade,
      literalCriteria: {
        expression: { $: criterio }
      },
      fields: {
        field: campos.map(function (campo) {
          return { name: campo };
        })
      }
    }
  };

  return ServiceProxy.callService('mge@crud.find', requestBody)
    .then(function (result) {
      var registros = result.responseBody.entidades.entidade;
      if (!registros) return [];
      return angular.isArray(registros) ? registros : [registros];
    });
}

export function salvarEntidade(ServiceProxy, entidade, dados) {
  var campos = Object.keys(dados).map(function (nome) {
    return {
      nome: nome,
      $: dados[nome]
    };
  });

  return ServiceProxy.callService('mge@crud.save', {
    entity: {
      name: entidade,
      campo: campos
    }
  });
}
```

Exemplo de uso:

```javascript
consultarEntidade(
  ServiceProxy,
  'Usuario',
  ['CODUSU', 'NOMEUSU'],
  'CODUSU = ' + Number(codUsu)
).then(console.log);

salvarEntidade(ServiceProxy, 'AD_MINHAENTIDADE', {
  CODIGO: 1,
  DESCRICAO: 'Teste',
  ATIVO: 'S'
}).then(function (result) {
  if (result.status === 1) {
    console.log('Registro salvo.');
  }
});
```

## 10. Resumo dos serviços

| Serviço | Utilização |
|---|---|
| `mge@crud.find` | Consultar uma entidade |
| `mge@crud.save` | Inserir ou salvar um registro de uma entidade |
| `mge@DatasetSP.save` | Salvar registros por dataset, inclusive em lote |
| `mge@ActionButtonsSP.executeJava` | Executar uma Ação Java cadastrada no Sankhya |

## 11. Recomendações

1. Use sempre o nome da entidade cadastrado no Sankhya, não presuma que seja igual ao nome da tabela.
2. Valide os valores antes de montar um `literalCriteria`.
3. Prefira `Criteria` com parâmetros quando o componente permitir.
4. Normalize o retorno de `crud.find`, pois um único registro pode retornar como objeto.
5. Confira a ordem de `fields` e `records.values` no `DatasetSP.save`.
6. Trate `status` e `statusMessage` em todas as operações de gravação.
7. Atualize o dataset com `refresh()` depois de uma gravação quando a tela precisar refletir o banco.
8. Não considere `goToInsertionMode()` como persistência: ele pode alterar somente o estado em memória.
9. Para saber o que uma Ação Java realmente altera, analise a implementação associada ao seu `actionID`.
