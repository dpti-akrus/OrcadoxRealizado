import { Fragment, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, HelpCircle, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PeriodFilter from "../components/PeriodFilter.jsx";
import { initialAccounts, initialCompanies, initialCompanyGroups, initialCostCenters, months } from "../data/mockData.js";
import { fullYearPeriod, getMonthIndexes, getPeriodLabel, sumValuesInPeriod } from "../utils/monthPeriod.js";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const helpPdfUrl = `${import.meta.env.BASE_URL}manual-orcamento.pdf`;

const parseMoney = (value) => Number(String(value || "0").replace(/\./g, "").replace(",", ".")) || 0;

const formatInputMoney = (value) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const accountDescriptions = {
  201: "Use para despesas com salários, remunerações fixas e pagamentos recorrentes da equipe.",
  202: "Use para custos de manutenção, reparos e conservação de estruturas ou instalações.",
  203: "Use para consumo de energia elétrica e despesas diretamente ligadas à conta de luz."
};

export default function LancamentoOrcamentarioPage({ launchedBudgets, setLaunchedBudgets }) {
  const [selectedCompany, setSelectedCompany] = useState(initialCompanies[0]);
  const [selectedCr, setSelectedCr] = useState(initialCostCenters[0]);
  const [selectedAccount, setSelectedAccount] = useState(initialAccounts[0]);
  const [total, setTotal] = useState("120000,00");
  const [isTotalCalculatedFromMonths, setIsTotalCalculatedFromMonths] = useState(false);
  const [monthlyValues, setMonthlyValues] = useState(() => distributeEvenly(120000));
  const [launchFeedback, setLaunchFeedback] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompanyGroup, setSelectedCompanyGroup] = useState(null);
  const [selectedGridCompany, setSelectedGridCompany] = useState(null);
  const [expandedCrId, setExpandedCrId] = useState(null);
  const [launchStep, setLaunchStep] = useState(0);
  const [crSearch, setCrSearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [showRepeatPrompt, setShowRepeatPrompt] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpPdfStatus, setHelpPdfStatus] = useState("idle");
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [period, setPeriod] = useState(fullYearPeriod);

  const totalNumber = parseMoney(total);
  const monthIndexes = getMonthIndexes(period);
  const periodLabel = getPeriodLabel(period);
  const allocated = useMemo(
    () => monthlyValues.reduce((sum, value) => sum + parseMoney(value), 0),
    [monthlyValues]
  );
  const diff = Number((totalNumber - allocated).toFixed(2));
  const closed = Math.abs(diff) < 0.01;
  const canLaunch = closed && totalNumber > 0;
  const companySummaries = useMemo(
    () =>
      initialCompanies
        .filter((company) => !selectedCompanyGroup || company.groupId === selectedCompanyGroup.id)
        .map((company) => {
          const companyBudgets = launchedBudgets.filter((budget) => budget.company.id === company.id);

          return {
            company,
            value: companyBudgets.reduce((sum, budget) => sum + sumValuesInPeriod(budget.monthlyValues, period), 0)
          };
        }),
    [launchedBudgets, period, selectedCompanyGroup]
  );
  const companyGroupSummaries = useMemo(
    () =>
      initialCompanyGroups.map((group) => {
        const companyIds = new Set(initialCompanies.filter((company) => company.groupId === group.id).map((company) => company.id));
        const groupBudgets = launchedBudgets.filter((budget) => companyIds.has(budget.company.id));

        return {
          group,
          companiesCount: companyIds.size,
          value: groupBudgets.reduce((sum, budget) => sum + sumValuesInPeriod(budget.monthlyValues, period), 0)
        };
      }),
    [launchedBudgets, period]
  );
  const groupedBudgets = useMemo(() => {
    const groups = new Map();

    launchedBudgets
      .filter((budget) => !selectedGridCompany || budget.company.id === selectedGridCompany.id)
      .forEach((budget) => {
        const current = groups.get(budget.cr.id) || {
          cr: budget.cr,
          items: [],
          value: 0
        };

        const periodValue = sumValuesInPeriod(budget.monthlyValues, period);

        current.items.push({ ...budget, periodValue });
        current.value += periodValue;
        groups.set(budget.cr.id, current);
      });

    return Array.from(groups.values());
  }, [launchedBudgets, period, selectedGridCompany]);
  const selectedCompanyBudgets = useMemo(
    () => launchedBudgets.filter((budget) => selectedGridCompany && budget.company.id === selectedGridCompany.id),
    [launchedBudgets, selectedGridCompany]
  );
  const filteredCostCenters = useMemo(() => {
    const term = crSearch.trim().toLowerCase();

    if (!term) {
      return initialCostCenters;
    }

    return initialCostCenters.filter((cr) => cr.code.includes(term) || cr.name.toLowerCase().includes(term));
  }, [crSearch]);
  const filteredAccounts = useMemo(() => {
    const term = accountSearch.trim().toLowerCase();

    if (!term) {
      return initialAccounts;
    }

    return initialAccounts.filter((account) => account.code.includes(term) || account.name.toLowerCase().includes(term));
  }, [accountSearch]);

  function distributeEvenly(value = totalNumber) {
    const base = Math.floor((value / 12) * 100) / 100;
    const values = Array(12).fill(base);
    const current = values.reduce((sum, item) => sum + item, 0);
    values[11] += Number((value - current).toFixed(2));
    return values.map(formatInputMoney);
  }

  function updateMonth(index, value) {
    setMonthlyValues((current) => {
      const nextValues = current.map((item, itemIndex) => (itemIndex === index ? value : item));

      if (isTotalCalculatedFromMonths || !total.trim()) {
        const nextTotal = nextValues.reduce((sum, item) => sum + parseMoney(item), 0);
        setTotal(formatInputMoney(nextTotal));
        setIsTotalCalculatedFromMonths(true);
      }

      return nextValues;
    });
  }

  function handleTotalChange(value) {
    setTotal(value);
    setIsTotalCalculatedFromMonths(!value.trim());
  }

  function handleClearMonths() {
    setMonthlyValues(Array(12).fill("0,00"));

    if (isTotalCalculatedFromMonths) {
      setTotal("0,00");
    }
  }

  async function handleOpenHelp() {
    setShowHelp(true);
    setHelpPdfStatus("loading");

    try {
      const response = await fetch(helpPdfUrl, { method: "HEAD", cache: "no-store" });
      const contentType = response.headers.get("content-type") || "";
      setHelpPdfStatus(response.ok && contentType.includes("pdf") ? "available" : "missing");
    } catch {
      setHelpPdfStatus("missing");
    }
  }

  function handleDistribute() {
    setMonthlyValues(distributeEvenly(totalNumber));
    setLaunchFeedback("");
  }

  function handleLaunchBudget() {
    if (!canLaunch) {
      return;
    }

    if (editingBudget) {
      setLaunchedBudgets((current) =>
        current.map((budget) =>
          budget.id === editingBudget.id
            ? {
                ...budget,
                value: allocated,
                monthlyValues: monthlyValues.map(parseMoney)
              }
            : budget
        )
      );
      setEditingBudget(null);
      setLaunchFeedback("");
      setExpandedCrId(null);
      setIsFormOpen(false);
      setLaunchStep(0);
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
    setSelectedGridCompany(selectedCompany);
    setExpandedCrId(null);
    setShowRepeatPrompt(true);
  }

  function handleOpenForm() {
    setLaunchFeedback("");
    if (selectedGridCompany) {
      setSelectedCompany(selectedGridCompany);
    }
    setLaunchStep(0);
    setCrSearch("");
    setAccountSearch("");
    setShowRepeatPrompt(false);
    setEditingBudget(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setLaunchFeedback("");
    setIsFormOpen(false);
    setLaunchStep(0);
    setShowRepeatPrompt(false);
    setEditingBudget(null);
  }

  function handleSelectCompany(company) {
    setSelectedCompany(company);
    setSelectedGridCompany(company);
    setExpandedCrId(null);
  }

  function handleSelectCompanyGroup(group) {
    setSelectedCompanyGroup(group);
    setSelectedGridCompany(null);
    setExpandedCrId(null);
  }

  function handleBackToCompanies() {
    setSelectedGridCompany(null);
    setExpandedCrId(null);
    setLaunchFeedback("");
  }

  function handleBackToCompanyGroups() {
    setSelectedCompanyGroup(null);
    setSelectedGridCompany(null);
    setExpandedCrId(null);
    setLaunchFeedback("");
  }

  function handleSelectCr(cr) {
    setSelectedCr(cr);
    setLaunchStep(1);
  }

  function handleSelectAccount(account) {
    setSelectedAccount(account);
    setAccountSearch("");
    setLaunchStep(2);
  }

  function resetEntryValues() {
    setSelectedAccount(initialAccounts[0]);
    setTotal("120000,00");
    setIsTotalCalculatedFromMonths(false);
    setMonthlyValues(distributeEvenly(120000));
    setAccountSearch("");
    setLaunchFeedback("");
  }

  function handleRepeatInSameCr() {
    resetEntryValues();
    setShowRepeatPrompt(false);
    setLaunchStep(1);
  }

  function handleFinishLaunch() {
    setShowRepeatPrompt(false);
    setIsFormOpen(false);
    setLaunchStep(0);
  }

  function handleEditBudget(budget) {
    setSelectedCompanyGroup(initialCompanyGroups.find((group) => group.id === budget.company.groupId) || null);
    setSelectedCompany(budget.company);
    setSelectedGridCompany(budget.company);
    setSelectedCr(budget.cr);
    setSelectedAccount(budget.account);
    setTotal(formatInputMoney(budget.value));
    setIsTotalCalculatedFromMonths(false);
    setMonthlyValues(budget.monthlyValues.map(formatInputMoney));
    setEditingBudget(budget);
    setShowRepeatPrompt(false);
    setLaunchFeedback("");
    setIsFormOpen(true);
    setLaunchStep(2);
  }

  function handleExportBudgets() {
    if (!selectedGridCompany || selectedCompanyBudgets.length === 0) {
      return;
    }

    const rows = selectedCompanyBudgets.map((budget) => ({
      Empresa: budget.company.name,
      Centro: `${budget.cr.code} - ${budget.cr.name}`,
      Conta: `${budget.account.code} - ${budget.account.name}`,
      Período: periodLabel,
      Valor: sumValuesInPeriod(budget.monthlyValues, period)
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orcamentos");
    XLSX.writeFile(workbook, `orcamentos-${selectedGridCompany.name}.xlsx`);
  }

  function handleConfirmDelete() {
    if (!budgetToDelete) {
      return;
    }

    setLaunchedBudgets((current) => current.filter((budget) => budget.id !== budgetToDelete.id));
    if (editingBudget?.id === budgetToDelete.id) {
      setEditingBudget(null);
      setIsFormOpen(false);
      setLaunchStep(0);
    }
    setBudgetToDelete(null);
    setExpandedCrId(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Gestão orçamentária"
        title="Orçamento"
        description="Selecione um grupo, escolha a empresa e visualize os orçamentos por centro de resultado."
      />

      {!isFormOpen && <PeriodFilter period={period} onApply={setPeriod} />}

      {!isFormOpen && !selectedCompanyGroup && !selectedGridCompany && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companyGroupSummaries.map((summary) => (
            <CompanyGroupCard key={summary.group.id} summary={summary} periodLabel={periodLabel} onClick={() => handleSelectCompanyGroup(summary.group)} />
          ))}
        </section>
      )}

      {!isFormOpen && selectedCompanyGroup && !selectedGridCompany && (
        <section className="grid gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Grupo empresarial</span>
              <h2 className="text-xl font-extrabold text-akrus-900">{selectedCompanyGroup.name}</h2>
              <p className="text-sm text-slate-500">Selecione uma empresa para acessar os centros de resultado.</p>
            </div>
            <Button variant="secondary" onClick={handleBackToCompanyGroups}>
              Voltar para grupos
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companySummaries.map((summary) => (
              <CompanyCard key={summary.company.id} summary={summary} periodLabel={periodLabel} onClick={() => handleSelectCompany(summary.company)} />
            ))}
          </section>
        </section>
      )}

      {!isFormOpen && selectedGridCompany && groupedBudgets.length > 0 && (
        <section className="mb-5 grid gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-akrus-900">
                {selectedGridCompany.code} - {selectedGridCompany.name}
              </h2>
              <p className="text-sm text-slate-500">{selectedCompanyGroup?.name} / Empresa / Centros de resultado</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm font-bold text-akrus">{groupedBudgets.length} grupo(s)</span>
              <Button variant="secondary" onClick={handleBackToCompanies}>
                Voltar para empresas de {selectedCompanyGroup?.name}
              </Button>
              <Button onClick={handleExportBudgets}>Exportar</Button>
              <Button onClick={handleOpenForm}>+ Adicionar lançamento</Button>
            </div>
          </div>

          <div className="grid gap-2">
            {groupedBudgets.map((budget) => (
              <BudgetCard
                key={budget.cr.id}
                budget={budget}
                expanded={expandedCrId === budget.cr.id}
                onToggle={() => setExpandedCrId((current) => (current === budget.cr.id ? null : budget.cr.id))}
                onEditBudget={handleEditBudget}
                monthIndexes={monthIndexes}
                periodLabel={periodLabel}
              />
            ))}
          </div>
        </section>
      )}

      {!isFormOpen && selectedGridCompany && groupedBudgets.length === 0 && (
        <section className="app-panel grid min-h-[260px] place-items-center p-8 text-center">
          <div>
            <h2 className="text-xl font-extrabold text-akrus-900">
              Nenhum orçamento lançado para {selectedGridCompany.code} - {selectedGridCompany.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Use o botão + para adicionar o primeiro lançamento dessa empresa.</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Button variant="secondary" onClick={handleBackToCompanies}>
                Voltar para empresas de {selectedCompanyGroup?.name}
              </Button>
              <Button onClick={handleOpenForm}>+ Adicionar lançamento</Button>
            </div>
          </div>
        </section>
      )}

      {isFormOpen && (
        <section className="app-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-akrus-900">{editingBudget ? "Editar lançamento" : "Novo lançamento"}</h2>
              <p className="text-sm text-slate-500">
                Empresa: <strong className="text-akrus-900">{selectedCompany.name}</strong>
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!editingBudget && launchStep > 0 && (
                <Button variant="secondary" onClick={() => setLaunchStep((current) => Math.max(0, current - 1))}>
                  Voltar etapa
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseForm}>
                Voltar para orçamentos
              </Button>
            </div>
          </div>

          <div className="grid border-b border-slate-200 bg-slate-50 lg:grid-cols-3">
            <LaunchStep active={launchStep === 0} number="1" title="Centro de resultado" value={selectedCr.name} />
            <LaunchStep active={launchStep === 1} number="2" title="Conta contábil" value={selectedAccount.name} />
            <LaunchStep active={launchStep === 2} number="3" title="Valor e rateio" value="Valor total e meses" />
          </div>

          {launchStep === 0 && (
            <section className="p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-akrus-900">Centro de resultado</h2>
                  <p className="text-sm text-slate-500">Escolha o CR que receberá o lançamento dessa empresa.</p>
                </div>
                <input
                  className="form-input max-w-sm"
                  placeholder="Buscar por código ou descrição"
                  value={crSearch}
                  onChange={(event) => setCrSearch(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                {filteredCostCenters.map((cr) => (
                  <button
                    key={cr.id}
                    className="grid w-full gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-akrus/25 hover:bg-slate-50 md:grid-cols-[110px_1fr_auto]"
                    type="button"
                    onClick={() => handleSelectCr(cr)}
                  >
                    <span className="font-extrabold text-akrus">{cr.code}</span>
                    <span>
                      <strong className="block text-akrus-900">{cr.name}</strong>
                      <small className="text-slate-500">Centro de resultado disponível para orçamento</small>
                    </span>
                    <span className="self-center rounded-full bg-akrus-50 px-3 py-2 text-xs font-extrabold text-akrus">Selecionar</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {launchStep === 1 && (
            <div className="p-5">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-akrus-50 px-3 py-2 text-sm font-bold text-akrus">Empresa: {selectedCompany.name}</span>
                <span className="rounded-full bg-akrus-50 px-3 py-2 text-sm font-bold text-akrus">
                  CR: {selectedCr.code} - {selectedCr.name}
                </span>
              </div>

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-akrus-900">Conta contábil</h2>
                  <p className="text-sm text-slate-500">Pesquise e escolha a conta com base no código, nome e finalidade.</p>
                </div>
                <input
                  className="form-input max-w-sm"
                  placeholder="Buscar por código ou descrição"
                  value={accountSearch}
                  onChange={(event) => setAccountSearch(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                {filteredAccounts.length === 0 && <span className="rounded-lg border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">Nenhuma conta encontrada.</span>}
                {filteredAccounts.map((account) => (
                  <button
                    key={account.id}
                    className="grid w-full gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-akrus/25 hover:bg-slate-50 md:grid-cols-[120px_1fr_auto]"
                    type="button"
                    onClick={() => handleSelectAccount(account)}
                  >
                    <span className="font-extrabold text-akrus">{account.code}</span>
                    <span>
                      <strong className="block text-akrus-900">{account.name}</strong>
                      <small className="text-slate-500">{accountDescriptions[account.id] || "Use quando a despesa estiver relacionada a esta natureza contábil."}</small>
                    </span>
                    <span className="self-center rounded-full bg-akrus-50 px-3 py-2 text-xs font-extrabold text-akrus">Selecionar</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {launchStep === 2 && (
            <div className="p-5">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-akrus-50 px-3 py-2 text-sm font-bold text-akrus">Empresa: {selectedCompany.name}</span>
                <span className="rounded-full bg-akrus-50 px-3 py-2 text-sm font-bold text-akrus">
                  CR: {selectedCr.code} - {selectedCr.name}
                </span>
                <span className="rounded-full bg-akrus-50 px-3 py-2 text-sm font-bold text-akrus">
                  Conta: {selectedAccount.code} - {selectedAccount.name}
                </span>
              </div>

              <div className="mb-5">
                <h2 className="text-xl font-extrabold text-akrus-900">Valor e rateio mensal</h2>
                <p className="text-sm text-slate-500">O valor total é rateado igualmente, mas cada mês pode ser ajustado.</p>
              </div>

              <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <aside className="grid gap-4 xl:border-r xl:border-slate-200 xl:pr-6">

                  <label className="grid gap-2">
                    <span className="form-label">Valor total</span>
                    <input className="form-input" value={total} onChange={(event) => handleTotalChange(event.target.value)} />
                  </label>

                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                    <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Rateio</span>
                    <strong className="text-sm text-akrus-900">Igual entre os 12 meses</strong>
                  </div>

                  <Button onClick={handleDistribute}>Ratear novamente</Button>

                  <div className="grid gap-3 rounded-lg bg-akrus-50 p-4">
                    <SummaryLine label="Total informado" value={money.format(totalNumber)} />
                    <SummaryLine label="Total rateado" value={money.format(allocated)} />
                    <SummaryLine label="Diferença" value={money.format(diff)} danger={!closed} />
                  </div>
                </aside>

                <section className="min-w-0">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-extrabold text-akrus-900">Meses do orçamento</h3>
                    <Button variant="ghost" onClick={handleClearMonths}>
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
                    <span>Edite qualquer mês direto na grade. A diferença atualiza na hora.</span>
                    <strong className={closed ? "text-emerald-700" : "text-red-600"}>
                      {closed ? "Rateio fechado" : "Existe diferença no rateio"}
                    </strong>
                  </div>
                </section>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {launchFeedback && <span className="block font-bold text-emerald-700">{launchFeedback}</span>}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {editingBudget && (
                    <Button variant="danger" onClick={() => setBudgetToDelete(editingBudget)}>
                      Excluir orçamento
                    </Button>
                  )}
                  <Button disabled={!canLaunch} onClick={handleLaunchBudget}>
                    {editingBudget ? "Salvar alterações" : "Lançar orçamento"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <button
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-akrus text-white shadow-[0_12px_28px_rgba(23,63,98,0.3)] transition hover:-translate-y-0.5 hover:bg-akrus-800 focus:outline-none focus:ring-4 focus:ring-akrus/20"
        type="button"
        onClick={handleOpenHelp}
        aria-label="Ajuda"
        title="Ajuda"
      >
        <HelpCircle className="h-7 w-7" strokeWidth={2.4} />
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-3 sm:p-5">
          <section className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-[0_22px_65px_rgba(15,43,68,0.3)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-akrus-50 text-akrus">
                  <HelpCircle className="h-5 w-5" strokeWidth={2.3} />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-akrus-900">Manual de ajuda</h2>
                  <p className="text-xs text-slate-500">manual-orcamento.pdf</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setShowHelp(false)}>Voltar</Button>
            </div>

            <div className="min-h-0 flex-1 bg-slate-100 p-3 sm:p-4">
              {helpPdfStatus === "available" && (
                <iframe className="h-full w-full rounded-lg border border-slate-200 bg-white" src={helpPdfUrl} title="Manual de ajuda do orçamento" />
              )}

              {helpPdfStatus === "loading" && (
                <div className="grid h-full place-items-center rounded-lg border border-slate-200 bg-white text-center">
                  <div>
                    <strong className="text-akrus-900">Carregando manual...</strong>
                    <p className="mt-1 text-sm text-slate-500">Aguarde enquanto o PDF é localizado.</p>
                  </div>
                </div>
              )}

              {helpPdfStatus === "missing" && (
                <div className="grid h-full place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
                  <div>
                    <HelpCircle className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.8} />
                    <strong className="mt-3 block text-lg text-akrus-900">Manual ainda não disponível</strong>
                    <p className="mt-1 max-w-lg text-sm text-slate-500">
                      Adicione o arquivo <strong>manual-orcamento.pdf</strong> na raiz do projeto para exibi-lo aqui.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {showRepeatPrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2.4} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-akrus-900">Orçamento lançado com sucesso</h2>
                <p className="mt-1 text-sm text-slate-500">
                  O lançamento foi gravado em {selectedCr.code} - {selectedCr.name}.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <strong className="block text-sm text-akrus-900">Lançar novamente nesse centro?</strong>
              <p className="mt-1 text-sm text-slate-500">Mantenha a mesma empresa e CR para escolher outra conta e informar um novo valor.</p>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleFinishLaunch}>
                Não, voltar ao grid
              </Button>
              <Button onClick={handleRepeatInSameCr}>Sim, lançar novamente</Button>
            </div>
          </section>
        </div>
      )}

      {budgetToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]">
            <h2 className="text-xl font-extrabold text-akrus-900">Excluir orçamento?</h2>
            <p className="mt-2 text-sm text-slate-500">
              Esta ação removerá o lançamento da conta {budgetToDelete.account.code} - {budgetToDelete.account.name} no centro {budgetToDelete.cr.code} - {budgetToDelete.cr.name}.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setBudgetToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Excluir orçamento
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function CompanyCard({ summary, periodLabel, onClick }) {
  return (
    <button
      className="app-panel grid gap-4 p-5 text-left transition hover:border-akrus/25 hover:bg-slate-50"
      type="button"
      onClick={onClick}
    >
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Empresa</span>
        <strong className="mt-1 block text-xl text-akrus-900">
          {summary.company.code} - {summary.company.name}
        </strong>
        <span className="text-sm text-slate-500">{summary.company.systemName}</span>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Orçado · {periodLabel}</span>
        <strong className="text-lg text-akrus-900">{money.format(summary.value)}</strong>
      </div>
    </button>
  );
}

function CompanyGroupCard({ summary, periodLabel, onClick }) {
  return (
    <button
      className="app-panel grid gap-4 p-5 text-left transition hover:border-akrus/25 hover:bg-slate-50"
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Grupo empresarial</span>
          <strong className="mt-1 block text-xl text-akrus-900">{summary.group.name}</strong>
          <span className="text-sm text-slate-500">{summary.companiesCount} empresa(s)</span>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-akrus-50 text-akrus">
          <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
        </span>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Orçamento do grupo · {periodLabel}</span>
        <strong className="text-lg text-akrus-900">{money.format(summary.value)}</strong>
      </div>
    </button>
  );
}

function LaunchStep({ active, number, title, value }) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-slate-200 p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${
        active ? "bg-akrus text-white" : "bg-slate-50 text-slate-500"
      }`}
    >
      <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-extrabold ${active ? "bg-white/20" : "bg-akrus-50 text-akrus"}`}>
        {number}
      </span>
      <span>
        <strong className={`block text-sm ${active ? "text-white" : "text-akrus-900"}`}>{title}</strong>
        <small className={active ? "text-white/75" : "text-slate-500"}>{value}</small>
      </span>
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

function BudgetCard({ budget, expanded, onToggle, onEditBudget, monthIndexes, periodLabel }) {
  const [expandedAccountId, setExpandedAccountId] = useState(null);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 md:grid-cols-[1.4fr_1fr_auto] md:items-center"
        type="button"
        onClick={onToggle}
      >
        <div>
          <span className="mb-1 block text-xs font-bold text-slate-500">Lançado por Carlos André</span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Centro de resultado</span>
          <strong className="block text-sm text-akrus-900">
            {budget.cr.code} - {budget.cr.name}
          </strong>
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Contas lançadas</span>
          <strong className="block text-sm text-akrus-900">{budget.items.length}</strong>
        </div>

        <div className="flex items-end justify-between gap-3 md:block md:text-right">
          <span>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Valor · {periodLabel}</span>
            <strong className="block text-base text-akrus-900">{money.format(budget.value)}</strong>
          </span>
          <span className="text-xl font-bold text-akrus">{expanded ? "−" : "+"}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-[520px] w-full border-collapse text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-3 text-left">Conta</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                  <th className="px-3 py-3 text-right">Editar</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map((item) => {
                  const accountExpanded = expandedAccountId === item.id;

                  return (
                    <Fragment key={item.id}>
                      <tr
                        className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                        onClick={() => setExpandedAccountId((current) => (current === item.id ? null : item.id))}
                        title="Clique para visualizar os valores mensais"
                      >
                        <td className="px-3 py-3 font-bold text-akrus-900">
                          <span className="flex items-center gap-2">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-akrus-50 text-sm font-extrabold text-akrus">
                              {accountExpanded ? "−" : "+"}
                            </span>
                            {item.account.code} - {item.account.name}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-akrus-900">{money.format(item.periodValue)}</td>
                        <td className="px-3 py-3 text-right">
                          <button
                            className="inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus transition hover:border-akrus/25 hover:bg-slate-50"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditBudget(item);
                            }}
                            aria-label={`Editar orçamento da conta ${item.account.code}`}
                            title="Editar orçamento"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={2.2} />
                          </button>
                        </td>
                      </tr>

                      {accountExpanded && (
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td colSpan="3" className="p-3">
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                              <table className="min-w-[920px] w-full border-collapse text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                                  <tr>
                                    {monthIndexes.map((index) => (
                                      <th key={months[index]} className="border-l border-slate-100 px-3 py-2.5 text-right first:border-l-0">{months[index]}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-t border-slate-200">
                                    {monthIndexes.map((index) => (
                                      <td key={months[index]} className="border-l border-slate-100 px-3 py-3 text-right font-bold tabular-nums text-akrus-900 first:border-l-0">
                                        {money.format(item.monthlyValues[index])}
                                      </td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}
