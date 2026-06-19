# Contexto de arquitetura — Aplicação React dentro do Sankhya

## 1. Objetivo deste documento

Este documento define como organizar as funções de acesso a dados, helpers e regras da aplicação de lançamento orçamentário desenvolvida em React e executada dentro do ERP Sankhya.

O frontend já existe e é compilado com Vite. O sistema final será publicado dentro do ambiente Sankhya usando os arquivos gerados na pasta `dist`.

O objetivo da reorganização é:

- evitar funções JavaScript espalhadas pelas páginas e componentes;
- centralizar a comunicação com os recursos nativos do Sankhya;
- facilitar depuração, manutenção e evolução;
- reaproveitar funções comuns entre telas;
- manter os componentes React focados na interface;
- permitir que o Vite empacote automaticamente todos os módulos no build final.

## 2. Contexto de execução

A aplicação não será hospedada como um site externo. Ela será implantada e executada dentro do ambiente autenticado do Sankhya.

Durante o desenvolvimento, o código deve permanecer dividido em arquivos e módulos ES (`import` e `export`). Ao executar `npm run build`, o Vite resolverá os imports e empacotará o código nos arquivos finais da pasta `dist`.

Não é necessário copiar manualmente todas as funções para `index.html`, `main.jsx` ou para um único arquivo JavaScript.

Estrutura final esperada do build:

```text
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

No `vite.config.js`, manter o caminho dos assets relativo para funcionar quando o pacote for publicado no Sankhya:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./"
});
```

## 3. Regra principal para o Codex

Antes de criar ou alterar funções de acesso ao Sankhya, o Codex deve inspecionar o projeto e localizar:

- funções já existentes que utilizam `NativeSql`;
- funções de consulta, inclusão, alteração e exclusão;
- formato real dos parâmetros aceitos pelo ambiente Sankhya;
- formato real do retorno das consultas;
- tratamento atual de erros e mensagens;
- convenções já utilizadas para sessão e usuário logado.

O Codex não deve inventar uma assinatura para `NativeSql` sem verificar o código existente. As funções deste documento representam a arquitetura desejada; a implementação deve ser adaptada à API e aos padrões já comprovadamente utilizados no projeto.

Ao reorganizar código existente:

- preservar integralmente a regra de negócio atual;
- não alterar SQL, filtros ou formato dos dados sem necessidade;
- mover e reutilizar código antes de tentar reescrevê-lo;
- evitar alterações visuais não solicitadas;
- manter compatibilidade com o build e com o ambiente Sankhya.

## 4. Estrutura de pastas recomendada

```text
src/
├── components/
│   ├── common/
│   ├── forms/
│   └── tables/
├── pages/
│   ├── LancamentoOrcamentario/
│   ├── Empresas/
│   ├── CentrosResultado/
│   └── ContasOrcamentarias/
├── services/
│   ├── sankhya/
│   │   ├── nativeSqlService.js
│   │   ├── sessionService.js
│   │   └── responseMapper.js
│   ├── empresaService.js
│   ├── centroResultadoService.js
│   ├── contaOrcamentariaService.js
│   └── orcamentoService.js
├── helpers/
│   ├── dateHelpers.js
│   ├── numberHelpers.js
│   ├── stringHelpers.js
│   └── objectHelpers.js
├── validators/
│   ├── orcamentoValidator.js
│   └── cadastroValidator.js
├── hooks/
│   ├── useEmpresas.js
│   ├── useCentrosResultado.js
│   └── useOrcamentos.js
├── constants/
│   ├── routes.js
│   └── messages.js
├── App.jsx
└── main.jsx
```

Não é obrigatório criar todos os arquivos imediatamente. Criar apenas os módulos necessários e evoluir a estrutura conforme o sistema crescer.

## 5. Separação de responsabilidades

O fluxo padrão deve ser:

```text
Componente ou página React
        ↓
Hook, quando necessário
        ↓
Service da entidade ou do caso de uso
        ↓
Service nativo do Sankhya
        ↓
NativeSql / recurso nativo do ERP
```

### 5.1 Componentes e páginas

Responsáveis por:

- renderizar a interface;
- controlar estado visual;
- capturar dados dos formulários;
- exibir carregamento, sucesso e erro;
- chamar funções dos services ou hooks.

Não devem conter SQL nem detalhes da API nativa do Sankhya.

### 5.2 Services de domínio

Responsáveis pelas operações relacionadas a cada entidade ou caso de uso.

Exemplos:

```js
buscarEmpresas();
buscarEmpresaPorCodigo(codigo);
salvarEmpresa(dados);
excluirEmpresa(codigo);

buscarCentrosResultado();
buscarContasOrcamentarias();

buscarLancamentos(filtros);
salvarLancamentoOrcamentario(dados);
excluirLancamentoOrcamentario(codigo);
```

Essas funções devem utilizar internamente o service central do Sankhya.

### 5.3 Service nativo do Sankhya

Responsável por centralizar:

- execução de consultas com `NativeSql`;
- normalização do retorno;
- tratamento técnico de erro;
- logs de desenvolvimento;
- funções comuns de CRUD, quando forem compatíveis com a API existente.

Exemplo conceitual, que deve ser adaptado à implementação real encontrada no projeto:

```js
export async function executarConsulta(sql, parametros = {}) {
  // Utilizar aqui a implementação NativeSql já validada no projeto.
}

export async function buscarDados(configuracao) {
  // Montar ou executar a consulta conforme o padrão real do projeto.
}
```

### 5.4 Helpers

Helpers devem ser funções puras, sem dependência da interface ou do Sankhya.

Exemplos:

```js
formatarMoeda(valor);
formatarData(data);
normalizarTexto(texto);
converterValorDecimal(valor);
removerCamposVazios(objeto);
```

### 5.5 Validators

Responsáveis por validações reutilizáveis antes de enviar dados para persistência.

Exemplo:

```js
export function validarLancamento(dados) {
  const erros = {};

  if (!dados.codigoEmpresa) {
    erros.codigoEmpresa = "Selecione uma empresa.";
  }

  if (!dados.codigoCentroResultado) {
    erros.codigoCentroResultado = "Selecione um centro de resultado.";
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros
  };
}
```

## 6. Padrão para `buscarDados`

Pode existir uma função genérica chamada `buscarDados`, mas ela deve ficar dentro da camada de services e ser usada de forma controlada.

Assinatura conceitual:

```js
buscarDados({
  tabela,
  campos,
  filtros,
  ordenacao
});
```

Exemplo de utilização interna:

```js
import { buscarDados } from "./sankhya/nativeSqlService";

export function buscarEmpresas() {
  return buscarDados({
    tabela: "TSIEMP",
    campos: ["CODEMP", "NOMEFANTASIA"],
    filtros: {
      ATIVO: "S"
    },
    ordenacao: "NOMEFANTASIA"
  });
}
```

Entretanto, páginas e componentes devem preferir funções específicas, como `buscarEmpresas()`, em vez de chamar diretamente:

```js
buscarDados("TSIEMP", ...);
```

Isso evita que nomes de tabelas, campos e regras SQL fiquem espalhados pela aplicação.

## 7. Parâmetros e montagem de SQL

Sempre que a API nativa permitir, utilizar parâmetros em vez de concatenar diretamente valores recebidos da tela.

Evitar:

```js
const sql = `SELECT * FROM AD_TABELA WHERE CODIGO = ${codigo}`;
```

Preferir o mecanismo de parâmetros aceito pela implementação real do `NativeSql` utilizada no projeto.

Nomes de tabelas, campos e ordenações não devem ser recebidos livremente de inputs do usuário. Eles devem ser definidos pelos services da aplicação.

## 8. Services previstos para o lançamento orçamentário

### `empresaService.js`

- listar empresas;
- buscar empresa por código;
- preparar opções para campos de seleção;
- realizar CRUD caso a aplicação utilize tabela adicional própria.

### `centroResultadoService.js`

- listar centros de resultado;
- buscar centro por código;
- filtrar centros ativos ou permitidos;
- realizar CRUD das entidades adicionais relacionadas.

### `contaOrcamentariaService.js`

- listar contas orçamentárias;
- buscar conta por código;
- relacionar contas com natureza, centro ou outras entidades definidas pelo sistema;
- realizar CRUD das tabelas adicionais.

### `orcamentoService.js`

- consultar lançamentos orçamentários;
- consultar um lançamento por código;
- criar lançamento;
- alterar lançamento;
- excluir ou inativar lançamento;
- validar duplicidade conforme a regra de negócio;
- centralizar consultas que envolvam mais de uma entidade.

## 9. Exemplo de uso em componente

```jsx
import { useEffect, useState } from "react";
import { buscarEmpresas } from "../../services/empresaService";

export default function EmpresaSelect({ value, onChange }) {
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        setCarregando(true);
        setErro("");
        const dados = await buscarEmpresas();
        setEmpresas(dados);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        setErro("Não foi possível carregar as empresas.");
      } finally {
        setCarregando(false);
      }
    }

    carregarEmpresas();
  }, []);

  if (carregando) return <span>Carregando empresas...</span>;
  if (erro) return <span>{erro}</span>;

  return (
    <select value={value} onChange={onChange}>
      <option value="">Selecione</option>
      {empresas.map((empresa) => (
        <option key={empresa.CODEMP} value={empresa.CODEMP}>
          {empresa.NOMEFANTASIA}
        </option>
      ))}
    </select>
  );
}
```

Os nomes das propriedades retornadas devem seguir o formato real entregue pelo Sankhya. Caso seja necessária normalização, realizá-la em `responseMapper.js` ou no service da entidade, e não dentro do componente.

## 10. Tratamento de erros e logs

As funções de acesso ao Sankhya devem lançar erros para que o componente decida como apresentá-los.

Padrão esperado:

```js
try {
  const dados = await buscarEmpresas();
  setEmpresas(dados);
} catch (error) {
  console.error("Erro ao buscar empresas:", error);
  setMensagem("Não foi possível carregar as empresas.");
}
```

Não ocultar erros silenciosamente.

Durante o desenvolvimento, os logs devem conter contexto suficiente para identificar a operação, mas não devem imprimir dados sensíveis desnecessariamente.

## 11. Regras de implementação

1. Não colocar SQL diretamente em componentes React.
2. Não concentrar todas as funções em `App.jsx`, `main.jsx` ou `index.html`.
3. Utilizar `import` e `export` normalmente.
4. Criar um service por entidade ou conjunto coerente de operações.
5. Centralizar a integração com `NativeSql` em `services/sankhya`.
6. Reutilizar a implementação nativa que já funciona no projeto.
7. Não inventar métodos ou assinaturas do Sankhya.
8. Preservar as regras de negócio e consultas existentes durante a refatoração.
9. Preferir funções específicas de domínio nas páginas e componentes.
10. Usar helpers apenas para transformações reutilizáveis e sem efeitos colaterais.
11. Manter loading, erro e estado de formulário dentro da camada React ou de hooks.
12. Testar o projeto com `npm run build` depois das alterações.
13. Conferir se o `dist/index.html` referencia assets por caminhos relativos.
14. Não incluir arquivos de desenvolvimento desnecessários no pacote enviado ao Sankhya.

## 12. Processo recomendado para a próxima implementação

Ao receber este documento, o Codex deve seguir esta ordem:

1. analisar a estrutura atual do repositório;
2. localizar todas as utilizações de `NativeSql` e funções semelhantes;
3. documentar rapidamente o formato real de chamada e retorno encontrado;
4. criar `src/services/sankhya/nativeSqlService.js` usando o código já funcional;
5. mover uma operação existente para um service de domínio como primeira validação;
6. atualizar o componente para importar o service;
7. confirmar que a tela continua funcionando sem alteração visual ou de regra;
8. executar o build;
9. repetir a migração gradualmente para as demais entidades e páginas.

## 13. Resultado esperado

Ao final da organização, uma página deverá importar operações simples e legíveis:

```js
import {
  buscarLancamentos,
  salvarLancamentoOrcamentario,
  excluirLancamentoOrcamentario
} from "../../services/orcamentoService";
```

Os detalhes de `NativeSql`, tabelas, SQL, parâmetros e normalização de retorno permanecerão encapsulados nos services.

Essa separação existe no código-fonte para facilitar manutenção e depuração. O Vite continuará gerando os arquivos JavaScript finais necessários para publicação dentro do Sankhya.
