# Contexto de entidades — Orçamento x Realizado

Este documento define a estrutura atual das entidades usadas pelo aplicativo **Orçamento x Realizado** integrado ao ERP Sankhya.

> Contexto revisado após simplificação da regra.  
> A regra de versionamento foi removida.  
> A tabela de orçamento mensal foi removida.  
> O orçamento agora trabalha com **cabeçalho anual + lançamentos mensais diretos**.

---

## 0. Premissas confirmadas

| Assunto | Regra atual |
|---|---|
| Tabela principal | `AD_ORCAMENTO` |
| Chave do cabeçalho | `AD_ORCAMENTO.NUORC` |
| Tabela de lançamentos | `AD_ORCLANC` |
| FK do lançamento para o orçamento | `AD_ORCLANC.NUORC` |
| Campo de empresa no lançamento | `AD_ORCLANC.IDORCEMP` |
| Campo de centro de resultado no lançamento | `AD_ORCLANC.IDORCCUS` |
| Campo de conta contábil no lançamento | `AD_ORCLANC.IDORCCTA` |
| Campo de mês no lançamento | `AD_ORCLANC.MES` |
| Campo de valor orçado no lançamento | `AD_ORCLANC.VLRORCADO` |
| Status do orçamento | `AD_ORCAMENTO.STATUS` |

Não usar mais no modelo atual:

```text
AD_ORCVER
IDVERSAO
AD_ORCAMENTOMES
NUORCMES
NUROC
AD_ORCLANC.ID como campo de centro
AD_ORCLANC.CODEMP
AD_ORCLANC.CODCENCUS
AD_ORCLANC.CODCTACTB
```

Regra geral:

```text
A aplicação deve usar os campos físicos exatamente como existem no Sankhya.
O campo correto do cabeçalho é NUORC.
O campo correto de centro dentro da AD_ORCLANC é IDORCCUS.
Não recriar lógica de versão.
Não recriar tabela mensal separada.
```

---

# 1. Visão geral da estrutura atual

A estrutura atual é simples:

```text
AD_ORCAMENTO
   └──< AD_ORCLANC
```

Papel de cada tabela:

| Tabela | Papel |
|---|---|
| `AD_ORCAMENTO` | Cabeçalho anual do orçamento. Representa o orçamento de um exercício. |
| `AD_ORCLANC` | Lançamentos mensais do orçamento. Cada linha representa empresa + centro + conta + mês + valor. |

Regra fundamental:

```text
AD_ORCAMENTO é a capa anual do orçamento.
AD_ORCLANC contém os valores mensais.
Cada lançamento da AD_ORCLANC pertence diretamente a um NUORC.
Não existe versão entre o orçamento e o lançamento.
```

Exemplo conceitual:

```text
Orçamento 2026
   ├── Empresa 1 + Centro 10 + Conta 500 + Janeiro + R$ 5.000,00
   ├── Empresa 1 + Centro 10 + Conta 500 + Fevereiro + R$ 7.000,00
   └── Empresa 2 + Centro 15 + Conta 800 + Janeiro + R$ 3.000,00
```

---

# 2. Entidades nativas do ERP

Estas tabelas já existem no Sankhya e não devem ser recriadas.

| Tabela | Finalidade | Campo principal usado pelo app |
|---|---|---|
| `TSIEMP` | Empresas nativas do ERP | `CODEMP` |
| `TSICUS` | Centros de resultado/custo nativos | `CODCENCUS` |
| `TCBPLA` | Plano de contas contábil | `CODCTACTB` |
| `TCBMET` | Metas contábeis/histórico orçamentário | `CODEMP`, `CODCENCUS`, `CODCTACTB`, `CODPROJ`, `DTREF`, `PREVISTO`, `REALIZADO` |
| `TSIUSU` | Usuários do ERP | `CODUSU` |

## 2.1. `TCBMET` — Meta Contábil

A `TCBMET` é a fonte dos lançamentos/metas antigas importadas anteriormente por planilha.

Mapeamento para a estrutura atual:

| Campo da `TCBMET` | Uso no app |
|---|---|
| `EXTRACT(YEAR FROM DTREF)` | `AD_ORCAMENTO.EXERCICIO` |
| `CODEMP` | Localizar/criar `AD_ORCEMP` e gravar `AD_ORCLANC.IDORCEMP` |
| `CODCENCUS` | Localizar/criar `AD_ORCCUS` e gravar `AD_ORCLANC.IDORCCUS` |
| `CODCTACTB` | Localizar/criar `AD_ORCCTA` e gravar `AD_ORCLANC.IDORCCTA` |
| `CODPROJ` | Usar em `AD_ORCAMENTO.CODPROJ`, quando aplicável |
| `EXTRACT(MONTH FROM DTREF)` | `AD_ORCLANC.MES` |
| `SUM(PREVISTO)` | `AD_ORCLANC.VLRORCADO` |
| `REALIZADO` | Usar apenas na visão de realizado, se a regra da empresa considerar este campo válido |

Não gravar diretamente na `TCBMET` pelo app sem validar regra nativa, eventos e processos contábeis do Sankhya.

## 2.2. `TCBPLA` — Plano de contas

Campos principais para o aplicativo:

| Campo | Uso |
|---|---|
| `CODCTACTB` | Conta reduzida e chave de vínculo com `AD_ORCCTA.CODCTACTB` |
| `CTACTB` | Classificação/código textual da conta |
| `DESCRCTA` | Descrição da conta |
| `ATIVA` | Indica se a conta está ativa |
| `ANALITICA` | Indica se a conta é analítica |
| `RECDESP` | Tipo/natureza da conta |
| `CODCTACTBPAI` | Conta pai |

---

# 3. Tabelas adicionais do aplicativo

## 3.1. `AD_ORCGRUEMP` — Grupos de empresas

Tabela de apoio para agrupar empresas no app.

| Campo | Tipo lógico | Regra |
|---|---|---|
| `IDGRUPEMP` | Número Inteiro | PK do grupo |
| `NOMEGRUPO` | Texto | Nome exibido no app |
| `DESCRGRUPO` | Texto | Descrição opcional |
| `ATIVO` | Texto | `S` ou `N` |
| `CODUSUINC` | Número Inteiro | Usuário de inclusão |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário de alteração |
| `DHALT` | Data e Hora | Data de alteração |

Relacionamento:

```text
AD_ORCGRUEMP.IDGRUPEMP 1 ─── N AD_ORCEMP.IDGRUPEMP
```

## 3.2. `AD_ORCEMP` — Empresas disponíveis no app

Tabela de apoio para definir quais empresas aparecem no app e seus nomes amigáveis.

| Campo | Tipo lógico | Regra |
|---|---|---|
| `IDORCEMP` | Número Inteiro | PK da empresa no app |
| `IDGRUPEMP` | Número Inteiro | FK para `AD_ORCGRUEMP.IDGRUPEMP` |
| `CODEMP` | Número Inteiro | FK para `TSIEMP.CODEMP` |
| `NOME` | Texto | Nome amigável exibido no app |
| `ATIVO` | Texto | `S` ou `N` |
| `CODUSUINC` | Número Inteiro | Usuário de inclusão |
| `DHINC` | Data e Hora | Data de inclusão |
| `CODUSUALT` | Número Inteiro | Usuário de alteração |
| `DHALT` | Data e Hora | Data de alteração |

Regras:

```text
AD_ORCEMP.IDORCEMP é usado dentro de AD_ORCLANC.IDORCEMP.
AD_ORCEMP.CODEMP é o vínculo com TSIEMP.CODEMP.
Quando precisar do código real da empresa, fazer join com AD_ORCEMP.
```

## 3.3. `AD_ORCCUS` — Centros de resultado disponíveis

Tabela de apoio para centros de resultado/custo disponíveis no app.

| Campo | Descrição no Sankhya | Tipo lógico | Regra |
|---|---|---|---|
| `ID` | ID Centro de resultado | Número Inteiro | PK física da tabela de centro |
| `CODCENCUS` | Código | Número Inteiro | FK para `TSICUS.CODCENCUS` |
| `NOME` | Nome | Texto | Nome amigável exibido no app |
| `ATIVO` | Ativo | Texto / Lista de opções | `S` ou `N` |
| `CODUSUINC` | Usuário de inclusão | Número Inteiro | Auditoria |
| `DHINC` | Data de inclusão | Data e Hora | Auditoria |
| `CODUSUALT` | Usuário de alteração | Número Inteiro | Auditoria |
| `DHALT` | Data de alteração | Data e Hora | Auditoria |

Restrições recomendadas:

```text
PK: AD_ORCCUS.ID
UK: AD_ORCCUS.CODCENCUS
FK: AD_ORCCUS.CODCENCUS -> TSICUS.CODCENCUS
```

Atenção:

```text
Na tabela AD_ORCCUS, a PK física continua sendo ID.
Na tabela AD_ORCLANC, o campo FK para centro agora é IDORCCUS.
Portanto o join correto é AD_ORCLANC.IDORCCUS -> AD_ORCCUS.ID.
```

## 3.4. `AD_ORCCTA` — Contas contábeis disponíveis

Tabela de apoio para contas contábeis disponíveis no app.

| Campo | Descrição no Sankhya | Tipo lógico | Regra |
|---|---|---|---|
| `IDORCCTA` | ID Conta contábil | Número Inteiro | PK da conta no app |
| `CODCTACTB` | Conta reduzida | Número Inteiro | FK para `TCBPLA.CODCTACTB` |
| `ATIVA` | Ativa | Texto / Lista de opções | `S` ou `N` |
| `DESCRICAO` | Descrição da Conta | Texto | Descrição/orientação exibida no app |
| `NOME` | Nome da conta | Texto | Nome amigável exibido no app |
| `CODUSUINC` | Usuário de inclusão | Número Inteiro | Auditoria |
| `DHINC` | Data de inclusão | Data e Hora | Auditoria |
| `CODUSUALT` | Usuário de alteração | Número Inteiro | Auditoria |
| `DHALT` | Data de alteração | Data e Hora | Auditoria |

Restrições recomendadas:

```text
PK: AD_ORCCTA.IDORCCTA
UK: AD_ORCCTA.CODCTACTB
FK: AD_ORCCTA.CODCTACTB -> TCBPLA.CODCTACTB
```

Regra:

```text
AD_ORCLANC guarda IDORCCTA.
Para obter CODCTACTB real, fazer join AD_ORCLANC.IDORCCTA -> AD_ORCCTA.IDORCCTA.
```

## 3.5. `AD_ORCUSU` — Configuração dos usuários no app

Tabela de apoio para permissões e perfil do usuário no app.

| Campo | Tipo lógico | Regra |
|---|---|---|
| `IDORCUSU` | Número Inteiro | PK |
| `CODUSU` | Número Inteiro | FK para `TSIUSU.CODUSU` |
| `NOMEAPP` | Texto | Nome exibido no app |
| `CARGO` | Texto | Cargo/função exibida |
| `TIPOUSU` | Texto | Perfil do usuário |
| `ATIVO` | Texto | `S` ou `N` |

Valores de `TIPOUSU`:

| Valor | Significado |
|---|---|
| `N` | Normal |
| `A` | Administrador |
| `D` | Administrativo |

## 3.6. `AD_ORCUSUCUS` — Centros permitidos por usuário

Tabela associativa para permissões por centro de resultado.

| Campo | Tipo lógico | Regra |
|---|---|---|
| `IDORCUSUCUS` | Número Inteiro | PK da associação |
| `IDORCUSU` | Número Inteiro | FK para `AD_ORCUSU.IDORCUSU` |
| `IDORCCUS` ou campo equivalente | Número Inteiro | Deve apontar para `AD_ORCCUS.ID` |
| `ATIVO` | Texto | `S` ou `N` |

Atenção:

```text
Mesmo que a associação use o nome IDORCCUS, a tabela de centro AD_ORCCUS tem PK física ID.
```

---

# 4. Entidades principais do orçamento

## 4.1. `AD_ORCAMENTO` — Cabeçalho anual do orçamento

Tabela principal do orçamento. Representa um orçamento por exercício.

| Campo | Descrição no Sankhya | Tipo lógico | Regra |
|---|---|---|---|
| `NUORC` | Número do Orçamento / ID Cabeçalho Orçamento | Número Inteiro | PK física do cabeçalho |
| `EXERCICIO` | Ano do Orçamento | Número Inteiro | Ano do orçamento. Exemplo: `2026` |
| `CODPROJ` | Projeto | Número Inteiro | Projeto do orçamento, quando aplicável. Não é o ano |
| `STATUS` | Status | Texto / Lista de opções | `E` = Em Elaboração, `O` = Oficial |
| `OBSERVACAO` | Observações | Texto | Observações gerais |
| `CODUSURESP` | Responsável | Número Inteiro | Usuário responsável. FK recomendada para `TSIUSU.CODUSU` |
| `CODUSUINC` | Usuário de inclusão | Número Inteiro | Auditoria |
| `DHINC` | Data/Hora de inclusão | Data e Hora | Auditoria |
| `CODUSUALT` | Usuário de alteração | Número Inteiro | Auditoria |
| `DHALT` | Data/Hora de alteração | Data e Hora | Auditoria |

Campos que não devem ficar no cabeçalho como regra analítica:

```text
IDORCLANC
IDORCEMP
IDORCCUS
IDORCCTA
MES
VLRORCADO
```

Esses campos pertencem à `AD_ORCLANC`.

Restrições recomendadas:

```text
PK: AD_ORCAMENTO.NUORC
FK recomendada: AD_ORCAMENTO.CODUSURESP -> TSIUSU.CODUSU
CHECK recomendado: STATUS IN ('E', 'O')
UK recomendada: EXERCICIO + NVL(CODPROJ, 0), se a regra permitir apenas um orçamento por ano/projeto
```

Domínio de `STATUS`:

| Valor | Significado | Regra |
|---|---|---|
| `E` | Em Elaboração | Permite inclusão/edição/exclusão de lançamentos |
| `O` | Oficial | Bloqueia inclusão/edição/exclusão de lançamentos para usuário comum |

Regra de status:

```text
Quando AD_ORCAMENTO.STATUS = 'E':
  usuários podem lançar, editar e excluir lançamentos.

Quando AD_ORCAMENTO.STATUS = 'O':
  orçamento fica bloqueado para lançamento, edição e exclusão.

Usuário administrador pode alterar o status para reabrir ou oficializar o orçamento.
A validação deve existir na ação de salvar/editar/excluir, não apenas na interface.
```

Observação sobre `NUORC`:

```text
Em INSERT SQL direto, o NUORC pode não ser gerado automaticamente pelo banco.
Se não existir sequence/trigger, será necessário informar NUORC.
Para produção, preferir sequence/trigger ou rotina segura de numeração.
Evitar MAX(NUORC) + 1 como solução definitiva.
```

## 4.2. `AD_ORCLANC` — Lançamento orçamentário mensal

Tabela dos lançamentos mensais do orçamento.

Cada linha da `AD_ORCLANC` representa:

```text
Orçamento + Empresa + Centro de Resultado + Conta Contábil + Mês + Valor Orçado
```

| Campo | Descrição no Sankhya | Tipo lógico | Regra |
|---|---|---|---|
| `IDORCLANC` | Código do lançamento | Número Inteiro | PK do lançamento |
| `NUORC` | Número do Orçamento | Número Inteiro | FK para `AD_ORCAMENTO.NUORC` |
| `IDORCEMP` | ID da Empresa | Número Inteiro | FK para `AD_ORCEMP.IDORCEMP` |
| `IDORCCUS` | ID Centro de resultado | Número Inteiro | FK para `AD_ORCCUS.ID` |
| `IDORCCTA` | ID Conta contábil | Número Inteiro | FK para `AD_ORCCTA.IDORCCTA` |
| `MES` | Mês | Número Inteiro / Lista de opções | Número de `1` a `12` |
| `VLRORCADO` | Valor Orçado | Número Decimal | Valor orçado do mês |
| `DESCRLANC` | Nome do lançamento | Texto | Nome/descrição da linha |
| `OBSERVACAO` | Observação | Texto | Observação da linha |
| `ORIGEM` | Origem do Lançamento | Texto / Lista de opções | `M`, `P`, `C` ou `I`, conforme lista do ambiente |
| `ATIVA` | Ativa | Texto / Lista de opções | `S` ou `N` |
| `IDORCLANCORIG` | Código de Origem | Número Inteiro | FK para `AD_ORCLANC.IDORCLANC` quando vier de cópia/importação |
| `CODUSUINC` | Usuário de inclusão | Número Inteiro | Auditoria |
| `DHINC` | Data de inclusão | Data e Hora | Auditoria |
| `CODUSUALT` | Usuário de alteração | Número Inteiro | Auditoria |
| `DHALT` | Data de alteração | Data e Hora | Auditoria |

Domínio de `ORIGEM` em `AD_ORCLANC`:

| Valor | Significado |
|---|---|
| `M` | Manual |
| `P` | Planilha |
| `C` | Cópia |
| `I` | Importado legado, se existir na lista de opções do ambiente |

Regra do mês:

```text
Na tela: Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez.
No banco: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.
```

Restrições recomendadas:

```text
PK: AD_ORCLANC.IDORCLANC
FK: AD_ORCLANC.NUORC -> AD_ORCAMENTO.NUORC
FK: AD_ORCLANC.IDORCEMP -> AD_ORCEMP.IDORCEMP
FK: AD_ORCLANC.IDORCCUS -> AD_ORCCUS.ID
FK: AD_ORCLANC.IDORCCTA -> AD_ORCCTA.IDORCCTA
FK: AD_ORCLANC.IDORCLANCORIG -> AD_ORCLANC.IDORCLANC
CHECK recomendado: MES BETWEEN 1 AND 12
CHECK recomendado: ATIVA IN ('S', 'N')
UK recomendada: NUORC + IDORCEMP + IDORCCUS + IDORCCTA + MES + NVL(ATIVA, 'S')
```

Atenção para empresa, centro e conta:

```text
AD_ORCLANC não deve gravar CODEMP, CODCENCUS ou CODCTACTB diretamente.
Ela grava os IDs das tabelas de apoio:

AD_ORCLANC.IDORCEMP -> AD_ORCEMP.IDORCEMP -> AD_ORCEMP.CODEMP -> TSIEMP.CODEMP
AD_ORCLANC.IDORCCUS -> AD_ORCCUS.ID       -> AD_ORCCUS.CODCENCUS -> TSICUS.CODCENCUS
AD_ORCLANC.IDORCCTA -> AD_ORCCTA.IDORCCTA -> AD_ORCCTA.CODCTACTB -> TCBPLA.CODCTACTB
```

Observação sobre `IDORCLANC`:

```text
Em INSERT SQL direto, o IDORCLANC pode não ser gerado automaticamente pelo banco.
Se não existir sequence/trigger, será necessário informar IDORCLANC.
Para produção, preferir sequence/trigger ou rotina segura de numeração.
Evitar MAX(IDORCLANC) + 1 como solução definitiva.
```

---

# 5. Relacionamentos oficiais

## 5.1. Hierarquia principal

```text
AD_ORCAMENTO.NUORC
    └──< AD_ORCLANC.NUORC
```

## 5.2. Relacionamentos de apoio e nativos

```text
TSIEMP.CODEMP
    └──< AD_ORCEMP.CODEMP
            └──< AD_ORCLANC.IDORCEMP

TSICUS.CODCENCUS
    └──< AD_ORCCUS.CODCENCUS
            └──< AD_ORCLANC.IDORCCUS

TCBPLA.CODCTACTB
    └──< AD_ORCCTA.CODCTACTB
            └──< AD_ORCLANC.IDORCCTA

TSIUSU.CODUSU
    ├──< AD_ORCAMENTO.CODUSURESP
    ├──< AD_ORCAMENTO.CODUSUINC / CODUSUALT
    └──< AD_ORCLANC.CODUSUINC / CODUSUALT
```

## 5.3. Modelo conceitual completo

```text
AD_ORCGRUEMP
   └──< AD_ORCEMP >── TSIEMP

TSICUS
   └──< AD_ORCCUS

TCBPLA
   └──< AD_ORCCTA

AD_ORCAMENTO
   └──< AD_ORCLANC
          ├── AD_ORCEMP >── TSIEMP
          ├── AD_ORCCUS >── TSICUS
          └── AD_ORCCTA >── TCBPLA
```

---

# 6. Regras de negócio do orçamento

## 6.1. Status do orçamento

O status oficial do orçamento fica em:

```sql
AD_ORCAMENTO.STATUS
```

Domínio atual:

| Valor | Significado |
|---|---|
| `E` | Em Elaboração |
| `O` | Oficial |

Regras:

```text
STATUS = 'E'
  Permite criar, editar e excluir lançamentos.

STATUS = 'O'
  Bloqueia criar, editar e excluir lançamentos para usuário comum.

Usuário administrador
  Pode alterar o status do orçamento quando necessário.
```

A validação deve ser feita antes de qualquer gravação:

```sql
SELECT STATUS
FROM AD_ORCAMENTO
WHERE NUORC = :NUORC
```

Se retornar `O`, bloquear gravações de lançamentos para usuário comum.

## 6.2. Valor total do orçamento

O valor total do orçamento deve ser calculado a partir dos lançamentos:

```sql
SUM(AD_ORCLANC.VLRORCADO)
```

Não depender de valor total salvo no cabeçalho.

## 6.3. Duplicidade de lançamento

Não deve existir mais de um lançamento ativo para a mesma combinação:

```text
NUORC + IDORCEMP + IDORCCUS + IDORCCTA + MES
```

Validação recomendada antes do insert:

```sql
SELECT COUNT(1) AS QTD
FROM AD_ORCLANC
WHERE NUORC = :NUORC
  AND IDORCEMP = :IDORCEMP
  AND IDORCCUS = :IDORCCUS
  AND IDORCCTA = :IDORCCTA
  AND MES = :MES
  AND NVL(ATIVA, 'S') = 'S'
```

Se `QTD > 0`, bloquear criação.

---

# 7. Importação dos lançamentos antigos da `TCBMET`

A importação da `TCBMET` deve transformar a estrutura antiga em orçamento anual e lançamentos mensais diretos.

## 7.1. Agrupamento recomendado

Agrupar por:

```text
Ano = EXTRACT(YEAR FROM TCBMET.DTREF)
Projeto = TCBMET.CODPROJ, quando aplicável
Empresa = TCBMET.CODEMP
Centro = TCBMET.CODCENCUS
Conta = TCBMET.CODCTACTB
Mês = EXTRACT(MONTH FROM TCBMET.DTREF)
```

## 7.2. Fluxo de importação

1. Para cada ano/projeto, criar ou localizar um `AD_ORCAMENTO`.
2. Definir `AD_ORCAMENTO.STATUS = 'E'` ou `O`, conforme decisão da empresa para histórico importado.
3. Para cada combinação de empresa/centro/conta/mês, localizar ou criar os cadastros de apoio:
   - `AD_ORCEMP` por `CODEMP`;
   - `AD_ORCCUS` por `CODCENCUS`;
   - `AD_ORCCTA` por `CODCTACTB`.
4. Criar ou atualizar uma linha em `AD_ORCLANC`.
5. Gravar na linha:
   - `NUORC`;
   - `IDORCEMP`;
   - `IDORCCUS`;
   - `IDORCCTA`;
   - `MES`;
   - `VLRORCADO`;
   - `ORIGEM = 'P'` ou `I`, conforme lista de opções do ambiente;
   - `ATIVA = 'S'`.

## 7.3. Correspondência entre `TCBMET` e a estrutura atual

```text
EXTRACT(YEAR FROM TCBMET.DTREF)     -> AD_ORCAMENTO.EXERCICIO
TCBMET.CODPROJ                      -> AD_ORCAMENTO.CODPROJ
TCBMET.CODEMP                       -> AD_ORCEMP.CODEMP -> AD_ORCLANC.IDORCEMP
TCBMET.CODCENCUS                    -> AD_ORCCUS.CODCENCUS -> AD_ORCLANC.IDORCCUS
TCBMET.CODCTACTB                    -> AD_ORCCTA.CODCTACTB -> AD_ORCLANC.IDORCCTA
EXTRACT(MONTH FROM TCBMET.DTREF)    -> AD_ORCLANC.MES
SUM(TCBMET.PREVISTO)                -> AD_ORCLANC.VLRORCADO
```

---

# 8. Consultas base para o aplicativo

## 8.1. Tela principal — cards por orçamento anual

A tela principal deve listar a `AD_ORCAMENTO` com resumo da `AD_ORCLANC`.

```sql
SELECT
    O.NUORC,
    O.EXERCICIO,
    O.STATUS,
    CASE
        WHEN O.STATUS = 'E' THEN 'Em Elaboração'
        WHEN O.STATUS = 'O' THEN 'Oficial'
        ELSE 'Indefinido'
    END AS STATUSDESC,
    O.CODPROJ,
    O.OBSERVACAO,
    O.CODUSURESP,
    O.DHINC,
    O.DHALT,
    NVL(SUM(L.VLRORCADO), 0) AS VLRORCADO,
    COUNT(L.IDORCLANC) AS QTDLANC
FROM AD_ORCAMENTO O
LEFT JOIN AD_ORCLANC L
       ON L.NUORC = O.NUORC
      AND NVL(L.ATIVA, 'S') = 'S'
GROUP BY
    O.NUORC,
    O.EXERCICIO,
    O.STATUS,
    O.CODPROJ,
    O.OBSERVACAO,
    O.CODUSURESP,
    O.DHINC,
    O.DHALT
ORDER BY
    O.EXERCICIO DESC,
    O.NUORC DESC;
```

## 8.2. Listar lançamentos de um orçamento

```sql
SELECT
    L.IDORCLANC,
    L.NUORC,
    L.IDORCEMP,
    EMP.CODEMP,
    EMP.NOME AS NOME_EMPRESA,
    L.IDORCCUS,
    CUS.CODCENCUS,
    CUS.NOME AS NOME_CENCUS,
    L.IDORCCTA,
    CTA.CODCTACTB,
    CTA.NOME AS NOME_CONTA,
    CTA.DESCRICAO AS DESCRICAO_CONTA,
    L.MES,
    CASE
        WHEN L.MES = 1 THEN 'Janeiro'
        WHEN L.MES = 2 THEN 'Fevereiro'
        WHEN L.MES = 3 THEN 'Março'
        WHEN L.MES = 4 THEN 'Abril'
        WHEN L.MES = 5 THEN 'Maio'
        WHEN L.MES = 6 THEN 'Junho'
        WHEN L.MES = 7 THEN 'Julho'
        WHEN L.MES = 8 THEN 'Agosto'
        WHEN L.MES = 9 THEN 'Setembro'
        WHEN L.MES = 10 THEN 'Outubro'
        WHEN L.MES = 11 THEN 'Novembro'
        WHEN L.MES = 12 THEN 'Dezembro'
        ELSE 'Indefinido'
    END AS MESDESC,
    L.VLRORCADO,
    L.DESCRLANC,
    L.OBSERVACAO,
    L.ORIGEM,
    L.ATIVA,
    L.DHINC,
    L.DHALT
FROM AD_ORCLANC L
LEFT JOIN AD_ORCEMP EMP
       ON EMP.IDORCEMP = L.IDORCEMP
LEFT JOIN AD_ORCCUS CUS
       ON CUS.ID = L.IDORCCUS
LEFT JOIN AD_ORCCTA CTA
       ON CTA.IDORCCTA = L.IDORCCTA
WHERE L.NUORC = :NUORC
  AND NVL(L.ATIVA, 'S') = 'S'
ORDER BY
    EMP.CODEMP,
    CUS.CODCENCUS,
    CTA.CODCTACTB,
    L.MES;
```

## 8.3. Filtro de período

Para filtrar meses, usar sempre o campo numérico:

```sql
L.MES BETWEEN :MES_INI AND :MES_FIM
```

Não filtrar por texto `Jan`, `Fev`, etc. Esses nomes são somente apresentação da tela.

---

# 9. Fluxos de gravação

## 9.1. Criar cabeçalho anual

Gravar em `AD_ORCAMENTO`:

```text
NUORC
EXERCICIO
CODPROJ
STATUS
OBSERVACAO
CODUSURESP
CODUSUINC
DHINC
```

Regra:

```text
STATUS sempre inicia como 'E' para orçamento criado manualmente.
Não permitir criar dois orçamentos para o mesmo exercício/projeto, se essa for a regra do negócio.
```

Insert base:

```sql
INSERT INTO AD_ORCAMENTO (
    NUORC,
    EXERCICIO,
    STATUS,
    CODPROJ,
    OBSERVACAO,
    CODUSURESP,
    CODUSUINC,
    DHINC
)
VALUES (
    :NUORC,
    :EXERCICIO,
    'E',
    :CODPROJ,
    :OBSERVACAO,
    :CODUSURESP,
    :CODUSUINC,
    SYSDATE
);
```

## 9.2. Criar lançamento mensal

Antes de gravar, validar o status do orçamento:

```sql
SELECT STATUS
FROM AD_ORCAMENTO
WHERE NUORC = :NUORC;
```

Se `STATUS = 'O'`, bloquear para usuário comum.

Gravar em `AD_ORCLANC`:

```text
IDORCLANC
NUORC
IDORCEMP
IDORCCUS
IDORCCTA
MES
VLRORCADO
DESCRLANC
OBSERVACAO
ORIGEM
ATIVA
CODUSUINC
DHINC
```

Insert base:

```sql
INSERT INTO AD_ORCLANC (
    IDORCLANC,
    NUORC,
    IDORCEMP,
    IDORCCUS,
    IDORCCTA,
    MES,
    VLRORCADO,
    DESCRLANC,
    OBSERVACAO,
    ORIGEM,
    ATIVA,
    CODUSUINC,
    DHINC
)
VALUES (
    :IDORCLANC,
    :NUORC,
    :IDORCEMP,
    :IDORCCUS,
    :IDORCCTA,
    :MES,
    :VLRORCADO,
    :DESCRLANC,
    :OBSERVACAO,
    :ORIGEM,
    'S',
    :CODUSUINC,
    SYSDATE
);
```

Nunca tentar inserir estes campos na `AD_ORCLANC`:

```text
CODEMP
CODCENCUS
CODCTACTB
IDVERSAO
```

---

# 10. Realizado

Ordem de preferência para o realizado:

1. Consultar o realizado contábil nativo do ERP, agrupado por empresa, centro, conta, projeto e mês.
2. Usar `TCBMET.REALIZADO` se esse campo representar corretamente o realizado validado pela empresa.
3. Criar/usar uma tabela adicional de realizado manual apenas se o realizado não puder ser obtido do ERP.

Se existir tabela manual `AD_ORCREAL`, ela deve se vincular preferencialmente a:

```text
NUORC
IDORCEMP
IDORCCUS
IDORCCTA
MES
VLRREALIZADO
```

---

# 11. Lista fechada de nomes confirmados/esperados

## 11.1. Tabelas principais do orçamento

```text
AD_ORCAMENTO
AD_ORCLANC
```

## 11.2. Tabelas de apoio usadas pelo contexto

```text
AD_ORCGRUEMP
AD_ORCEMP
AD_ORCCUS
AD_ORCCTA
AD_ORCUSU
AD_ORCUSUCUS
```

## 11.3. Tabelas nativas principais

```text
TCBMET
TCBPLA
TSIEMP
TSICUS
TSIUSU
```

## 11.4. Chaves principais

```text
AD_ORCAMENTO.NUORC
AD_ORCLANC.IDORCLANC
AD_ORCCUS.ID
AD_ORCCTA.IDORCCTA
AD_ORCEMP.IDORCEMP
```

## 11.5. Campos principais da `AD_ORCLANC`

```text
AD_ORCLANC.IDORCLANC
AD_ORCLANC.NUORC
AD_ORCLANC.IDORCEMP
AD_ORCLANC.IDORCCUS
AD_ORCLANC.IDORCCTA
AD_ORCLANC.MES
AD_ORCLANC.VLRORCADO
AD_ORCLANC.ORIGEM
AD_ORCLANC.ATIVA
```

## 11.6. Campos que não devem ser inventados/usados no modelo atual

```text
NUROC
IDVERSAO
NUORCMES
AD_ORCLANC.ID como centro
AD_ORCLANC.CODEMP
AD_ORCLANC.CODCENCUS
AD_ORCLANC.CODCTACTB
```

---

# 12. Empacotamento e publicação no Sankhya

## 12.1. Estrutura obrigatória do `index.jsp`

O arquivo publicado no Sankhya é `dist/index.jsp`. O `index.html` gerado pelo Vite não deve ser usado diretamente como página de entrada do aplicativo.

Estrutura validada:

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

Regras de publicação:

- Manter `isELIgnored="false"`, pois `${BASE_FOLDER}` precisa ser interpretado pelo JSP.
- Manter a taglib Sankhya e executar `<snk:load/>` dentro do `<head>`.
- Reaproveitar o parâmetro `nuGdg` recebido pela página; usar `010` somente quando ele não for informado ou não for numérico.
- Montar o React somente quando `embedded=true`, evitando loop de iframe.
- Referenciar CSS, JavaScript e demais arquivos publicados com o prefixo `${BASE_FOLDER}/`.
- Disponibilizar `${BASE_FOLDER}` ao React pelo atributo `data-base-folder` do elemento `#root`.
- Após cada `npm run build`, conferir em `dist/assets` os nomes reais dos arquivos com hash e atualizar as referências do `index.jsp`.
- Não copiar para o JSP a referência de desenvolvimento `/src/main.jsx` existente no `index.html` da raiz.
- Não substituir automaticamente o `index.jsp` validado pelo `dist/index.html` gerado pelo Vite.

---

# 13. Filtro de período

As telas de **Orçamento** e **Realizado** possuem filtro único de período, com mês inicial e mês final.

Regras:

- Padrão: ano completo, de janeiro a dezembro.
- Para consultar apenas um mês, `MES_INI` e `MES_FIM` devem ser iguais.
- Para consultar intervalo, usar `L.MES BETWEEN :MES_INI AND :MES_FIM`.
- O filtro deve permanecer ativo durante a navegação entre grupo, empresa, centro e conta.
- O valor exibido em cada nível deve ser a soma dos meses filtrados.
- A exportação deve respeitar o período ativo e identificar o período exportado.
- Limpar o filtro restaura janeiro a dezembro.

## 13.1. Ajuda durante o lançamento

- O botão flutuante da tela de orçamento é exclusivo para **Ajuda**.
- Deve exibir ícone de interrogação.
- Não deve abrir ações de criação de lançamento.
- A ajuda deve permanecer disponível da seleção do grupo empresarial até o lançamento mensal.
