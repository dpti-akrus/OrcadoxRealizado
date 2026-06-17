import { useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { initialAccounts, initialCompanies, initialCostCenters, months } from "../data/mockData.js";

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

export default function LancamentoOrcamentarioPage() {
  const [selectedCompany, setSelectedCompany] = useState(initialCompanies[0]);
  const [selectedCr, setSelectedCr] = useState(initialCostCenters[0]);
  const [selectedAccount, setSelectedAccount] = useState(initialAccounts[0]);
  const [total, setTotal] = useState("120000,00");
  const [monthlyValues, setMonthlyValues] = useState(() => distributeEvenly(120000));
  const [launchedBudgets, setLaunchedBudgets] = useState([]);
  const [launchFeedback, setLaunchFeedback] = useState("");

  const totalNumber = parseMoney(total);
  const allocated = useMemo(
    () => monthlyValues.reduce((sum, value) => sum + parseMoney(value), 0),
    [monthlyValues]
  );
  const diff = Number((totalNumber - allocated).toFixed(2));
  const closed = Math.abs(diff) < 0.01;
  const canLaunch = closed && totalNumber > 0;
  const groupedBudgets = useMemo(() => {
    const groups = new Map();

    launchedBudgets.forEach((budget) => {
      const current = groups.get(budget.cr.id) || {
        cr: budget.cr,
        accounts: new Map(),
        value: 0
      };

      current.accounts.set(budget.account.id, budget.account);
      current.value += budget.value;
      groups.set(budget.cr.id, current);
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      accounts: Array.from(group.accounts.values())
    }));
  }, [launchedBudgets]);

  function distributeEvenly(value = totalNumber) {
    const base = Math.floor((value / 12) * 100) / 100;
    const values = Array(12).fill(base);
    const current = values.reduce((sum, item) => sum + item, 0);
    values[11] += Number((value - current).toFixed(2));
    return values.map(formatInputMoney);
  }

  function updateMonth(index, value) {
    setMonthlyValues((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function handleDistribute() {
    setMonthlyValues(distributeEvenly());
    setLaunchFeedback("");
  }

  function handleLaunchBudget() {
    if (!canLaunch) {
      return;
    }

    setLaunchedBudgets((current) => [
      {
        id: Date.now(),
        company: selectedCompany,
        cr: selectedCr,
        account: selectedAccount,
        value: allocated,
        monthlyValues: monthlyValues.map(parseMoney)
      },
      ...current
    ]);
    setLaunchFeedback("Orçamento lançado e agrupado no início da tela.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Lançamento orçamentário"
        title="Lançar orçamento"
        description="Escolha empresa, CR, conta contábil e ajuste o rateio mensal quando necessário."
      />

      {groupedBudgets.length > 0 && (
        <section className="mb-5 grid gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-akrus-900">Orçamentos lançados</h2>
              <p className="text-sm text-slate-500">Agrupados por centro de resultado.</p>
            </div>
            <span className="text-sm font-bold text-akrus">{groupedBudgets.length} grupo(s)</span>
          </div>

          <div className="grid gap-2">
            {groupedBudgets.map((budget) => (
              <BudgetCard key={budget.cr.id} budget={budget} />
            ))}
          </div>
        </section>
      )}

      <section className="app-panel overflow-hidden">
        <div className="grid border-b border-slate-200 bg-slate-50 lg:grid-cols-3">
          <Step number="1" title="Empresa" value={selectedCompany.name} />
          <Step number="2" title="Centro de resultado" value={selectedCr.name} />
          <Step number="3" title="Conta e rateio" value="Valor total e meses" />
        </div>

        <div className="grid gap-6 p-5 xl:grid-cols-[360px_1fr]">
          <aside className="grid gap-4 xl:border-r xl:border-slate-200 xl:pr-6">
            <label className="grid gap-2">
              <span className="form-label">Empresa</span>
              <select
                className="form-input"
                value={selectedCompany.id}
                onChange={(event) => setSelectedCompany(initialCompanies.find((item) => item.id === Number(event.target.value)))}
              >
                {initialCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="form-label">Centro de resultado</span>
              <select
                className="form-input"
                value={selectedCr.id}
                onChange={(event) => setSelectedCr(initialCostCenters.find((item) => item.id === Number(event.target.value)))}
              >
                {initialCostCenters.map((cr) => (
                  <option key={cr.id} value={cr.id}>
                    {cr.code} - {cr.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="form-label">Conta contábil</span>
              <select
                className="form-input"
                value={selectedAccount.id}
                onChange={(event) => setSelectedAccount(initialAccounts.find((item) => item.id === Number(event.target.value)))}
              >
                {initialAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="form-label">Valor total</span>
              <input className="form-input" value={total} onChange={(event) => setTotal(event.target.value)} />
            </label>

            <Button onClick={handleDistribute}>Ratear novamente</Button>

            <div className="grid gap-3 rounded-lg bg-akrus-50 p-4">
              <SummaryLine label="Total informado" value={money.format(totalNumber)} />
              <SummaryLine label="Total rateado" value={money.format(allocated)} />
              <SummaryLine label="Diferença" value={money.format(diff)} danger={!closed} />
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-akrus-900">Meses do orçamento</h2>
                <p className="text-sm text-slate-500">Edite qualquer mês direto na grade.</p>
              </div>
              <Button variant="secondary" onClick={() => setMonthlyValues(Array(12).fill("0,00"))}>
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
                    <td className="sticky left-0 bg-white px-3 py-3 font-extrabold text-akrus-900">{selectedAccount.code}</td>
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

            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span>O fechamento compara o valor total com a soma dos meses.</span>
                <strong className={`block ${closed ? "text-emerald-700" : "text-red-600"}`}>
                  {closed ? "Rateio fechado" : "Existe diferença no rateio"}
                </strong>
                {launchFeedback && <span className="block font-bold text-emerald-700">{launchFeedback}</span>}
              </div>
              <Button disabled={!canLaunch} onClick={handleLaunchBudget}>
                Lançar orçamento
              </Button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function Step({ number, title, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-akrus text-sm font-extrabold text-white">{number}</span>
      <span>
        <strong className="block text-sm text-akrus-900">{title}</strong>
        <small className="text-slate-500">{value}</small>
      </span>
    </div>
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

function BudgetCard({ budget }) {
  return (
    <article className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.3fr_1.6fr_auto] md:items-center">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Centro de resultado</span>
        <strong className="block text-sm text-akrus-900">
          {budget.cr.code} - {budget.cr.name}
        </strong>
      </div>

      <div>
        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Contas</span>
        <strong className="block text-sm text-akrus-900">
          {budget.accounts.map((account) => `${account.code} - ${account.name}`).join(", ")}
        </strong>
      </div>

      <div className="md:text-right">
        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Valor</span>
        <strong className="block text-base text-akrus-900">{money.format(budget.value)}</strong>
      </div>
    </article>
  );
}
