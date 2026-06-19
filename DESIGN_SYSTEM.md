# Akrus — Design System
> Gestão Orçamentária · Versão 1.0

---

## 1. Fundação

### 1.1 Identidade

| Atributo | Valor |
|---|---|
| Produto | Gestão Orçamentária |
| Marca | AKRUS |
| Tagline | *Presente onde o agro estiver* |
| Framework | React + Tailwind CSS |
| Ícones | Lucide React |

---

## 2. Paleta de Cores

### 2.1 Cor Principal — Akrus Blue

A cor `akrus` é o token central da marca. Usada em CTAs, links ativos, badges, destaques e estados interativos.

| Token | Hex | RGB | Uso |
|---|---|---|---|
| `akrus` (base) | `#173F62` | 23, 63, 98 | Botões primários, texto de destaque, ícones ativos |
| `akrus-50` | `#EEF4FA` | 238, 244, 250 | Fundos de badge, chips, painéis de destaque leve |
| `akrus-800` | `#12324F` | 18, 50, 79 | Hover de botão primário |
| `akrus-900` | `#0F2B44` | 15, 43, 68 | Textos principais (headings, valores, labels fortes) |

> **Configuração Tailwind recomendada:**
> ```js
> // tailwind.config.js
> colors: {
>   akrus: {
>     DEFAULT: '#173F62',
>     50:  '#EEF4FA',
>     800: '#12324F',
>     900: '#0F2B44',
>   }
> }
> ```

### 2.2 Cor da Sidebar — Navy

Usada exclusivamente na barra de navegação lateral.

| Token | Hex | Uso |
|---|---|---|
| Navy | `#182540` | Background da sidebar |
| Navy hover item | `#FFFFFF` com `opacity: 0.1` | Item de nav inativo ao hover |

### 2.3 Neutros (Slate)

Paleta de suporte baseada em `slate` do Tailwind.

| Token | Hex aprox. | Uso |
|---|---|---|
| `slate-50` | `#F8FAFC` | Background de tabelas, seções alternadas |
| `slate-100` | `#F1F5F9` | Inputs em modo read-only, background de campos |
| `slate-200` | `#E2E8F0` | Bordas, divisores, linhas de tabela |
| `slate-400` | `#94A3B8` | Labels uppercase (eyebrows, cabeçalhos de coluna) |
| `slate-500` | `#64748B` | Textos secundários, subtítulos, placeholders |
| `slate-600` | `#475569` | Textos de suporte com mais presença |
| `slate-900` | `#0F172A` | Nunca usado diretamente (substituído por `akrus-900`) |

### 2.4 Feedback

| Nome | Classe / Hex | Uso |
|---|---|---|
| Sucesso | `text-emerald-700` / `bg-emerald-50` | Feedback de ação concluída, ícone CheckCircle |
| Erro / Perigo | `text-red-600` / `bg-red-50` | Diferenças de rateio, botão de exclusão, bordas de perigo |
| Overlay | `bg-slate-900/40` | Fundo de modais |

### 2.5 Background Geral

| Área | Cor |
|---|---|
| App background | `#F1F5F9` (slate-100) ou `#F3F4F6` |
| Card / Painel | `#FFFFFF` |
| Sidebar | `#182540` (Navy) |

---

## 3. Tipografia

### 3.1 Família

| Atributo | Valor |
|---|---|
| Família principal | **Inter** |
| Fallback | `ui-sans-serif, system-ui, sans-serif` |

### 3.2 Escala de Tamanhos

| Papel | Classe Tailwind | Tamanho | Peso | Uso |
|---|---|---|---|---|
| Page Title | `text-2xl font-extrabold` | 24px | 800 | Título principal da página |
| Section Title | `text-xl font-extrabold` | 20px | 800 | Título de seção interna, modais |
| Card Title | `text-lg font-extrabold` | 18px | 800 | Nome de empresa no card, nome do CR |
| Body Strong | `text-base font-bold` | 16px | 700 | Valores monetários, nomes em tabela |
| Body | `text-sm` | 14px | 400 | Textos gerais, descrições |
| Body Medium | `text-sm font-bold` | 14px | 700 | Labels de campo, metadados |
| Caption / Eyebrow | `text-xs font-extrabold uppercase tracking-wide` | 12px | 800 | Rótulos de categoria acima de títulos |
| Small | `text-xs` | 12px | 400 | Subtextos, hints, rodapés de card |

### 3.3 Padrões Recorrentes

```jsx
// Eyebrow (rótulo de categoria)
<span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
  Empresa
</span>

// Título de página
<h1 className="text-2xl font-extrabold text-akrus-900">Orçamento</h1>

// Descrição de página
<p className="text-sm text-slate-500">Selecione uma empresa...</p>

// Valor monetário
<strong className="text-lg text-akrus-900">R$ 0,00</strong>
```

---

## 4. Espaçamento

Sistema baseado na escala de 4px do Tailwind.

| Token | Valor | Uso comum |
|---|---|---|
| `gap-1` / `p-1` | 4px | Espaço mínimo entre ícone e texto |
| `gap-2` / `p-2` | 8px | Entre badges, pequenos elementos |
| `gap-3` / `p-3` | 12px | Entre itens de lista, gap de grid |
| `gap-4` / `p-4` | 16px | Padding interno de cards e painéis |
| `gap-5` / `p-5` | 20px | Padding interno de seções maiores |
| `gap-6` / `p-6` | 24px | Separação entre blocos de formulário |
| `mt-5` | 20px | Separação entre ação e conteúdo |

---

## 5. Bordas e Sombras

### 5.1 Border Radius

| Contexto | Classe | Valor |
|---|---|---|
| Cards, painéis, modais | `rounded-lg` | 8px |
| Badges, chips, pills | `rounded-full` | 9999px |
| Inputs, campos | `rounded-md` | 6px |
| Ícone-botão (ação inline) | `rounded-lg` | 8px |
| Seções internas destacadas | `rounded-2xl` | 16px |

### 5.2 Bordas

| Contexto | Classe |
|---|---|
| Cards e painéis | `border border-slate-200` |
| Linhas de tabela | `border-t border-slate-200` |
| Divisor de seção | `border-b border-slate-200` |
| Inputs padrão | `border border-slate-200` |
| Input em foco | `border-akrus` |
| Área vazia (dashed) | `border border-dashed border-slate-300` |
| Hover em card interativo | `hover:border-akrus/25` |

### 5.3 Sombras

| Contexto | Classe / Valor |
|---|---|
| Card padrão | `shadow-sm` |
| Modal / Dialog | `shadow-[0_22px_55px_rgba(15,43,68,0.22)]` |
| FAB (botão flutuante) | `shadow-[0_10px_24px_rgba(23,63,98,0.2)]` |

---

## 6. Componentes

### 6.1 Button

Três variantes definidas no componente `Button.jsx`:

#### Primary (padrão)
```jsx
<Button>Lançar orçamento</Button>
```
```css
bg-akrus text-white font-bold rounded-lg px-4 py-2
hover:bg-akrus-800
focus:ring-4 focus:ring-akrus/20
disabled:opacity-50 disabled:cursor-not-allowed
```

#### Secondary
```jsx
<Button variant="secondary">Voltar para orçamentos</Button>
```
```css
bg-white text-akrus-900 font-bold border border-slate-200 rounded-lg px-4 py-2
hover:bg-slate-50
```

#### Ghost
```jsx
<Button variant="ghost">Zerar meses</Button>
```
```css
bg-transparent text-akrus-900 font-bold rounded-lg px-4 py-2
hover:bg-slate-100
```

#### Danger
```jsx
<Button variant="danger">Excluir orçamento</Button>
```
```css
bg-red-600 text-white font-bold rounded-lg px-4 py-2
hover:bg-red-700
```

#### FAB (Floating Action Button)
```jsx
<button className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-akrus text-3xl font-bold text-white shadow-[0_10px_24px_rgba(23,63,98,0.2)] hover:bg-akrus-800 focus:ring-4 focus:ring-akrus/20" />
```

#### Ícone-Botão (ação inline em tabela)
```jsx
<button className="inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus hover:border-akrus/25 hover:bg-slate-50" />
```

---

### 6.2 Card de Empresa

Usado na tela de listagem de orçamentos e realizados.

```jsx
<button className="app-panel grid gap-4 p-5 text-left transition hover:border-akrus/25 hover:bg-slate-50">
  <div>
    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Empresa</span>
    <strong className="mt-1 block text-xl text-akrus-900">{name}</strong>
    <span className="text-sm text-slate-500">{systemName}</span>
  </div>
  <div className="border-t border-slate-200 pt-4">
    <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Valor total lançado</span>
    <strong className="text-lg text-akrus-900">{value}</strong>
  </div>
</button>
```

**Estrutura:**
- Eyebrow: `text-xs font-extrabold uppercase tracking-wide text-slate-400`
- Nome: `text-xl font-extrabold text-akrus-900`
- Subtítulo: `text-sm text-slate-500`
- Divisor: `border-t border-slate-200 pt-4`
- Valor: `text-lg font-extrabold text-akrus-900`

---

### 6.3 Painel / `app-panel`

Classe utilitária usada em todas as seções principais de conteúdo.

```css
/* app-panel */
background: #FFFFFF;
border: 1px solid #E2E8F0;   /* slate-200 */
border-radius: 8px;           /* rounded-lg */
box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* shadow-sm */
```

```jsx
<section className="app-panel p-5">
  {/* conteúdo */}
</section>
```

---

### 6.4 PageHeader

Componente de cabeçalho de página usado em todas as telas.

```jsx
<PageHeader
  eyebrow="Gestão orçamentária"
  title="Orçamento"
  description="Selecione uma empresa..."
/>
```

**Anatomia:**
```jsx
<div>
  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{eyebrow}</p>
  <h1 className="text-2xl font-extrabold text-akrus-900">{title}</h1>
  <p className="text-sm text-slate-500">{description}</p>
</div>
```

---

### 6.5 Stepper (Wizard de Lançamento)

Componente de 3 etapas usado no formulário de novo lançamento.

```jsx
<div className="grid border-b border-slate-200 bg-slate-50 lg:grid-cols-3">
  <LaunchStep active={step === 0} number="1" title="Centro de resultado" value={cr.name} />
  <LaunchStep active={step === 1} number="2" title="Conta contábil" value={account.name} />
  <LaunchStep active={step === 2} number="3" title="Valor e rateio" value="Valor total e meses" />
</div>
```

**Estados:**

| Estado | Background | Texto | Número |
|---|---|---|---|
| Ativo | `bg-akrus` | `text-white` | `bg-white/20 text-white` |
| Inativo | `bg-slate-50` | `text-slate-500` | `bg-akrus-50 text-akrus` |

---

### 6.6 Badge / Chip

Usado para mostrar contexto ativo (empresa, CR, conta selecionada).

```jsx
<span className="rounded-full bg-akrus-50 px-3 py-2 text-sm font-bold text-akrus">
  Empresa: {name}
</span>
```

| Variante | Classes |
|---|---|
| Padrão | `rounded-full bg-akrus-50 px-3 py-2 text-xs font-extrabold text-akrus` |
| CTA inline (selecionar) | `rounded-full bg-akrus-50 px-3 py-2 text-xs font-extrabold text-akrus` |

---

### 6.7 Inputs de Formulário

#### Classe `form-input`
```css
/* form-input */
width: 100%;
border: 1px solid #E2E8F0;
border-radius: 6px;
padding: 8px 12px;
font-size: 14px;
color: #0F2B44;
background: #FFFFFF;
outline: none;
transition: border-color 150ms;
```
```css
/* focus */
border-color: #173F62; /* akrus */
box-shadow: 0 0 0 3px rgba(23,63,98,0.1);
```

#### Classe `form-label`
```css
font-size: 12px;
font-weight: 700;
color: #64748B; /* slate-500 */
text-transform: uppercase;
letter-spacing: 0.05em;
```

#### Input inline de tabela (edição de valores mensais)
```css
width: 96px;
border: 1px solid transparent;
border-radius: 6px;
background: #F1F5F9; /* slate-100 */
padding: 8px;
text-align: right;
outline: none;
/* focus */
border-color: #173F62;
background: #FFFFFF;
```

#### Select
```jsx
<select className="form-input">
  <option>Normal</option>
  <option>Administrador</option>
</select>
```
Herda os estilos de `form-input`.

---

### 6.8 Tabela de Dados

Estrutura padrão usada em lançamentos e realizados.

```jsx
<div className="overflow-x-auto rounded-lg border border-slate-200">
  <table className="min-w-[520px] w-full border-collapse bg-white text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
      <tr>
        <th className="px-3 py-3 text-left">Conta</th>
        <th className="px-3 py-3 text-right">Valor</th>
        <th className="px-3 py-3 text-right">Editar</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-slate-200">
        <td className="px-3 py-3 font-bold text-akrus-900">...</td>
        <td className="px-3 py-3 text-right font-bold text-akrus-900">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Anatomia:**
- Container: `overflow-x-auto rounded-lg border border-slate-200`
- Tabela: `border-collapse bg-white text-sm`
- Cabeçalho: `bg-slate-50 text-xs uppercase tracking-wide text-slate-400`
- Célula header: `px-3 py-3`
- Linha: `border-t border-slate-200`
- Célula: `px-3 py-3 font-bold text-akrus-900`

---

### 6.9 Row de Lista Selecionável (CR / Conta Contábil)

Usado na etapa de seleção de Centro de Resultado e Conta Contábil.

```jsx
<button className="grid w-full gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-akrus/25 hover:bg-slate-50 md:grid-cols-[110px_1fr_auto]">
  <span className="font-extrabold text-akrus">{code}</span>
  <span>
    <strong className="block text-akrus-900">{name}</strong>
    <small className="text-slate-500">{description}</small>
  </span>
  <span className="self-center rounded-full bg-akrus-50 px-3 py-2 text-xs font-extrabold text-akrus">
    Selecionar
  </span>
</button>
```

---

### 6.10 Card Expansível (Accordion)

Padrão usado nos grupos de orçamento e de realizado.

```jsx
<article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
  {/* Trigger */}
  <button className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
    ...
    <span className="text-xl font-bold text-akrus">{expanded ? "−" : "+"}</span>
  </button>

  {/* Conteúdo expandido */}
  {expanded && (
    <div className="border-t border-slate-200 bg-slate-50 p-4">
      ...
    </div>
  )}
</article>
```

---

### 6.11 Modal / Dialog

```jsx
{/* Overlay */}
<div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
  {/* Panel */}
  <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]">
    <h2 className="text-xl font-extrabold text-akrus-900">Título do modal</h2>
    <p className="mt-2 text-sm text-slate-500">Descrição da ação.</p>
    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button variant="secondary">Cancelar</Button>
      <Button variant="danger">Confirmar</Button>
    </div>
  </section>
</div>
```

**Variantes de modal:**
- **Confirmação de sucesso** — Ícone `CheckCircle2` em `bg-emerald-50 text-emerald-700`
- **Confirmação de exclusão** — Botão `danger`, sem ícone
- **Prompt de repetição** — Fundo `bg-slate-50` com texto de apoio

---

### 6.12 Sidebar de Navegação

```jsx
<aside className="fixed left-0 top-0 h-full w-[220px] bg-[#182540]">
  {/* Logo */}
  <div className="p-5">
    <span className="text-lg font-bold text-white">AKRUS 🎁</span>
  </div>

  {/* Nav item — ativo */}
  <button className="w-[196px] mx-auto flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-akrus-900">
    <Icon /> Orçamento
  </button>

  {/* Nav item — inativo */}
  <button className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/70 hover:text-white">
    <Icon /> Realizado
  </button>
</aside>
```

**Estrutura de largura:** `w-[220px]` | Conteúdo principal com `ml-[220px]`

---

### 6.13 Painel de Resumo (Summary Aside)

Usado na etapa de valor e na tela de realizado.

```jsx
<aside className="grid gap-3 self-start rounded-lg bg-akrus-50 p-4">
  <SummaryLine label="Total informado" value="R$ 120.000,00" />
  <SummaryLine label="Total rateado" value="R$ 120.000,00" />
  <SummaryLine label="Diferença" value="R$ 0,00" danger={false} />
</aside>
```

```jsx
// SummaryLine
<div className="flex items-center justify-between gap-4 text-sm text-slate-500">
  <span>{label}</span>
  <strong className={danger ? "text-red-600" : "text-akrus-900"}>{value}</strong>
</div>
```

---

### 6.14 Estado Vazio (Empty State)

```jsx
<section className="app-panel grid min-h-[260px] place-items-center p-8 text-center">
  <div>
    <h2 className="text-xl font-extrabold text-akrus-900">Nenhum orçamento lançado</h2>
    <p className="mt-1 text-sm text-slate-500">Use o botão + para adicionar o primeiro lançamento.</p>
    <Button className="mt-5" variant="secondary">Voltar para empresas</Button>
  </div>
</section>
```

---

## 7. Layout e Grid

### 7.1 Estrutura Base

```
┌─────────────────────────────────────────────┐
│  Sidebar (220px fixo)  │  Main Content       │
│  bg: #182540           │  bg: slate-100      │
│                        │  p: 24–40px         │
└─────────────────────────────────────────────┘
```

### 7.2 Grids Responsivos

| Contexto | Mobile | Tablet | Desktop |
|---|---|---|---|
| Cards de empresa | `grid-cols-1` | `md:grid-cols-2` | `xl:grid-cols-3` |
| Formulário de valor | `grid-cols-1` | `grid-cols-1` | `xl:grid-cols-[360px_1fr]` |
| Linha de CR | `grid-cols-1` | `md:grid-cols-[110px_1fr_auto]` | idem |
| Realizado aside + table | `grid-cols-1` | `grid-cols-1` | `xl:grid-cols-[300px_1fr]` |
| Stepper | `grid-cols-1` | `grid-cols-1` | `lg:grid-cols-3` |
| Formulário de usuário | `grid-cols-1` | `grid-cols-1` | `lg:grid-cols-[240px_1fr]` |

---

## 8. Formatação de Dados

### 8.1 Moeda

```js
const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});
// Resultado: "R$ 120.000,00"
```

### 8.2 Input de Valor Monetário

```js
// Parse: string → número
const parseMoney = (value) =>
  Number(String(value || "0").replace(/\./g, "").replace(",", ".")) || 0;

// Format: número → string de input
const formatInputMoney = (value) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
```

### 8.3 Meses

```js
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                 "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
```

---

## 9. Iconografia

Biblioteca: **Lucide React**

| Ícone | Componente | Uso |
|---|---|---|
| Editar | `<Pencil className="h-4 w-4" strokeWidth={2.2} />` | Botão de edição inline |
| Excluir | `<Trash2 className="h-4 w-4" strokeWidth={2.2} />` | Remover vínculo de CR |
| Busca | `<Search className="h-4 w-4" strokeWidth={2.2} />` | Adorno esquerdo de input de busca |
| Sucesso | `<CheckCircle2 className="h-6 w-6" strokeWidth={2.4} />` | Modal de confirmação positiva |

**Padrão de tamanho:** `h-4 w-4` para ações inline, `h-6 w-6` para destaques.
**strokeWidth padrão:** `2.2` (ações) / `2.4` (destaques).

---

## 10. Estados de Interação

| Estado | Padrão visual |
|---|---|
| **Hover** em card/row | `hover:bg-slate-50 hover:border-akrus/25` |
| **Hover** em botão primário | `hover:bg-akrus-800` |
| **Focus** em input | `border-akrus + ring-4 ring-akrus/20` |
| **Disabled** em botão | `opacity-50 cursor-not-allowed` |
| **Selecionado / Ativo** (nav) | `bg-white text-akrus-900` (dentro da sidebar navy) |
| **Expanded** (accordion) | Exibe `−`, fundo `bg-slate-50` com borda superior |
| **Collapsed** (accordion) | Exibe `+` |
| **Rateio fechado** | `text-emerald-700` — "Rateio fechado" |
| **Rateio aberto** | `text-red-600` — "Existe diferença no rateio" |
| **Saldo negativo** | Valor em `text-red-600` |

---

## 11. Acessibilidade

| Prática | Implementação |
|---|---|
| Labels semânticos | `aria-label` em todos os botões de ícone |
| Atributo `title` | Presente em botões de ícone para tooltip nativo |
| Inputs com `<label>` | Todos os campos dentro de `<label>` ou com `htmlFor` |
| Datalist | Usado em campos de busca por código ERP |
| `readOnly` | Campos preenchidos automaticamente pelo sistema |
| Tabela min-width | `min-w-[980px]` com `overflow-x-auto` para scroll horizontal |
| Sticky coluna | `sticky left-0` na coluna de conta em tabelas largas |

---

## 12. Padrões de UX

| Padrão | Descrição |
|---|---|
| **Wizard multi-etapa** | 3 passos lineares: CR → Conta → Valor. Cada seleção avança automaticamente. |
| **Distribuição automática** | Valor total rateado igualmente entre 12 meses com ajuste no último. |
| **Feedback imediato** | Diferença de rateio calculada em tempo real. |
| **Prompt de repetição** | Após lançar, pergunta se quer lançar novamente no mesmo CR. |
| **Edição duplo-clique** | Linhas de tabela de usuários ativam edição com `onDoubleClick`. |
| **Card expansível** | Grupos de orçamento e realizado usam accordion com `+` / `−`. |
| **Estado vazio contextual** | Mensagens específicas por empresa selecionada sem orçamentos. |
| **FAB posicionado** | Botão `+` fixo em `bottom-6 right-6` aparece apenas ao selecionar empresa. |
| **Export XLSX** | Exportação de orçamentos com `SheetJS` direto pelo browser. |

---

## 13. Nomenclatura de Entidades

| Entidade | Atributos principais |
|---|---|
| **Empresa** | `id`, `name` (plataforma), `systemName` (ERP) |
| **Centro de Resultado (CR)** | `id`, `code`, `name`, `systemName` |
| **Conta Contábil** | `id`, `code`, `name` |
| **Lançamento** | `id`, `company`, `cr`, `account`, `value`, `monthlyValues[]` |
| **Realizado** | `budgetId`, `monthlyValues[]` |
| **Usuário** | `id`, `code`, `systemUserName`, `name`, `role`, `type`, `costCenterIds[]`, `active` |

---

*Akrus Design System · Extraído dos arquivos de produção · Junho 2026*