import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { initialCompanies, months } from "../data/mockData.js";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const parseMoney = (value) => Number(String(value || "0").replace(/\./g, "").replace(",", ".")) || 0;

const formatInputMoney = (value) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

export default function RealizadoPage({ launchedBudgets, realizedEntries, setRealizedEntries }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [expandedCrId, setExpandedCrId] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [monthlyValues, setMonthlyValues] = useState(Array(12).fill("0,00"));

  const companySummaries = useMemo(
    () =>
      initialCompanies.map((company) => {
        const companyBudgets = launchedBudgets.filter((budget) => budget.company.id === company.id);
        const companyRealized = realizedEntries
          .filter((entry) => companyBudgets.some((budget) => budget.id === entry.budgetId))
          .reduce((sum, entry) => sum + entry.monthlyValues.reduce((total, value) => total + value, 0), 0);

        return {
          company,
          budgeted: companyBudgets.reduce((sum, budget) => sum + budget.value, 0),
          realized: companyRealized
        };
      }),
    [launchedBudgets, realizedEntries]
  );

  const groupedBudgets = useMemo(() => {
    const groups = new Map();

    launchedBudgets
      .filter((budget) => selectedCompany && budget.company.id === selectedCompany.id)
      .forEach((budget) => {
        const current = groups.get(budget.cr.id) || {
          cr: budget.cr,
          items: [],
          budgeted: 0,
          realized: 0
        };
        const realized = getRealizedTotal(budget.id);

        current.items.push({ ...budget, realized });
        current.budgeted += budget.value;
        current.realized += realized;
        groups.set(budget.cr.id, current);
      });

    return Array.from(groups.values());
  }, [launchedBudgets, realizedEntries, selectedCompany]);

  function getRealizedEntry(budgetId) {
    return realizedEntries.find((entry) => entry.budgetId === budgetId);
  }

  function getRealizedTotal(budgetId) {
    const entry = getRealizedEntry(budgetId);

    return entry ? entry.monthlyValues.reduce((sum, value) => sum + value, 0) : 0;
  }

  function openRealizedForm(budget) {
    const entry = getRealizedEntry(budget.id);

    setEditingBudget(budget);
    setMonthlyValues(entry ? entry.monthlyValues.map(formatInputMoney) : Array(12).fill("0,00"));
  }

  function updateMonth(index, value) {
    setMonthlyValues((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function saveRealized() {
    if (!editingBudget) {
      return;
    }

    const values = monthlyValues.map(parseMoney);

    setRealizedEntries((current) => {
      const exists = current.some((entry) => entry.budgetId === editingBudget.id);

      if (exists) {
        return current.map((entry) => (entry.budgetId === editingBudget.id ? { ...entry, monthlyValues: values } : entry));
      }

      return [
        ...current,
        {
          budgetId: editingBudget.id,
          monthlyValues: values
        }
      ];
    });
    setEditingBudget(null);
  }

  if (editingBudget) {
    const realizedTotal = monthlyValues.reduce((sum, value) => sum + parseMoney(value), 0);

    return (
      <div>
        <PageHeader
          eyebrow="Realizado"
          title="Lançar realizado"
          description="Informe mês a mês quanto foi realizado para o orçamento selecionado."
        />

        <section className="app-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-akrus-900">
                {editingBudget.account.code} - {editingBudget.account.name}
              </h2>
              <p className="text-sm text-slate-500">
                {editingBudget.company.name} • {editingBudget.cr.code} - {editingBudget.cr.name}
              </p>
            </div>
            <Button variant="secondary" onClick={() => setEditingBudget(null)}>
              Voltar para orçados
            </Button>
          </div>

          <div className="grid gap-6 p-5 xl:grid-cols-[300px_1fr]">
            <aside className="grid gap-3 self-start rounded-lg bg-akrus-50 p-4">
              <SummaryLine label="Orçado" value={money.format(editingBudget.value)} />
              <SummaryLine label="Realizado" value={money.format(realizedTotal)} />
              <SummaryLine label="Saldo" value={money.format(editingBudget.value - realizedTotal)} danger={realizedTotal > editingBudget.value} />
            </aside>

            <section className="min-w-0">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-extrabold text-akrus-900">Realizado mês a mês</h3>
                <Button variant="ghost" onClick={() => setMonthlyValues(Array(12).fill("0,00"))}>
                  Zerar meses
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-[980px] border-collapse bg-white text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-akrus">
                    <tr>
                      <th className="sticky left-0 bg-slate-50 px-3 py-3 text-left">Conta</th>
                      {months.map((month) => (
                        <th key={month} className="px-3 py-3 text-right">
                          {month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-200">
                      <td className="sticky left-0 bg-white px-3 py-3 font-extrabold text-akrus-900">Orçado</td>
                      {editingBudget.monthlyValues.map((value, index) => (
                        <td key={`budgeted-${months[index]}`} className="px-2 py-3 text-right font-bold text-slate-500">
                          {money.format(value)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-200">
                      <td className="sticky left-0 bg-white px-3 py-3 font-extrabold text-akrus-900">Realizado</td>
                      {monthlyValues.map((value, index) => (
                        <td key={months[index]} className="px-2 py-3 text-right">
                          <input
                            className="w-24 rounded-md border border-transparent bg-slate-100 px-2 py-2 text-right outline-none focus:border-akrus focus:bg-white"
                            value={value}
                            onChange={(event) => updateMonth(index, event.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex justify-end">
                <Button onClick={saveRealized}>Salvar realizado</Button>
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Realizado"
        title="Realizado"
        description="Selecione uma empresa, abra o orçamento por CR e lance o realizado mês a mês."
      />

      {!selectedCompany && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companySummaries.map((summary) => (
            <button
              key={summary.company.id}
              className="app-panel grid gap-4 p-5 text-left transition hover:border-akrus/25 hover:bg-slate-50"
              type="button"
              onClick={() => setSelectedCompany(summary.company)}
            >
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Empresa</span>
                <strong className="mt-1 block text-xl text-akrus-900">{summary.company.name}</strong>
                <span className="text-sm text-slate-500">{summary.company.systemName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                <SummaryStat label="Orçado" value={money.format(summary.budgeted)} />
                <SummaryStat label="Realizado" value={money.format(summary.realized)} alignRight />
              </div>
            </button>
          ))}
        </section>
      )}

      {selectedCompany && groupedBudgets.length === 0 && (
        <section className="app-panel grid min-h-[260px] place-items-center p-8 text-center">
          <div>
            <h2 className="text-xl font-extrabold text-akrus-900">Nenhum orçamento lançado para {selectedCompany.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Lance o orçamento primeiro para registrar o realizado depois.</p>
            <Button className="mt-5" variant="secondary" onClick={() => setSelectedCompany(null)}>
              Voltar para empresas
            </Button>
          </div>
        </section>
      )}

      {selectedCompany && groupedBudgets.length > 0 && (
        <section className="grid gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-akrus-900">{selectedCompany.name}</h2>
              <p className="text-sm text-slate-500">Abra o CR para lançar realizado por conta.</p>
            </div>
            <Button variant="secondary" onClick={() => setSelectedCompany(null)}>
              Voltar para empresas
            </Button>
          </div>

          {groupedBudgets.map((group) => (
            <RealizedGroupCard
              key={group.cr.id}
              group={group}
              expanded={expandedCrId === group.cr.id}
              onToggle={() => setExpandedCrId((current) => (current === group.cr.id ? null : group.cr.id))}
              onEdit={openRealizedForm}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function RealizedGroupCard({ group, expanded, onToggle, onEdit }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center"
        type="button"
        onClick={onToggle}
      >
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Centro de resultado</span>
          <strong className="block text-sm text-akrus-900">
            {group.cr.code} - {group.cr.name}
          </strong>
        </div>
        <SummaryStat label="Orçado" value={money.format(group.budgeted)} />
        <SummaryStat label="Realizado" value={money.format(group.realized)} />
        <span className="text-xl font-bold text-akrus md:text-right">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-[680px] w-full border-collapse text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-3 text-left">Conta</th>
                  <th className="px-3 py-3 text-right">Orçado</th>
                  <th className="px-3 py-3 text-right">Realizado</th>
                  <th className="px-3 py-3 text-right">Lançar</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-3 py-3 font-bold text-akrus-900">
                      {item.account.code} - {item.account.name}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-akrus-900">{money.format(item.value)}</td>
                    <td className="px-3 py-3 text-right font-bold text-akrus-900">{money.format(item.realized)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        className="inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus transition hover:border-akrus/25 hover:bg-slate-50"
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Lançar realizado da conta ${item.account.code}`}
                        title="Lançar realizado"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2.2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}

function SummaryStat({ label, value, alignRight }) {
  return (
    <span className={alignRight ? "text-right" : ""}>
      <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <strong className="text-base text-akrus-900">{value}</strong>
    </span>
  );
}

function SummaryLine({ label, value, danger }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
      <span>{label}</span>
      <strong className={danger ? "text-red-600" : "text-akrus-900"}>{value}</strong>
    </div>
  );
}
