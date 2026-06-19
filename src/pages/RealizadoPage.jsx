import { Fragment, useMemo, useState } from "react";
import { ChevronRight, Database } from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PeriodFilter from "../components/PeriodFilter.jsx";
import {
  initialAccounts,
  initialCompanies,
  initialCompanyGroups,
  initialCostCenters,
  initialErpRealizedEntries,
  months
} from "../data/mockData.js";
import { fullYearPeriod, getMonthIndexes, getPeriodLabel, sumValuesInPeriod } from "../utils/monthPeriod.js";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const sumMonthlyValues = (entries, period) =>
  entries.reduce((total, entry) => total + sumValuesInPeriod(entry.monthlyValues, period), 0);

export default function RealizadoPage() {
  const [selectedCompanyGroup, setSelectedCompanyGroup] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [expandedCrId, setExpandedCrId] = useState(null);
  const [period, setPeriod] = useState(fullYearPeriod);
  const monthIndexes = getMonthIndexes(period);
  const periodLabel = getPeriodLabel(period);

  const companyGroupSummaries = useMemo(
    () =>
      initialCompanyGroups.map((group) => {
        const companyIds = new Set(
          initialCompanies.filter((company) => company.groupId === group.id).map((company) => company.id)
        );
        const entries = initialErpRealizedEntries.filter((entry) => companyIds.has(entry.companyId));

        return {
          group,
          companiesCount: companyIds.size,
          value: sumMonthlyValues(entries, period)
        };
      }),
    [period]
  );

  const companySummaries = useMemo(() => {
    if (!selectedCompanyGroup) {
      return [];
    }

    return initialCompanies
      .filter((company) => company.groupId === selectedCompanyGroup.id)
      .map((company) => {
        const entries = initialErpRealizedEntries.filter((entry) => entry.companyId === company.id);

        return {
          company,
          value: sumMonthlyValues(entries, period)
        };
      });
  }, [period, selectedCompanyGroup]);

  const groupedRealized = useMemo(() => {
    if (!selectedCompany) {
      return [];
    }

    const groups = new Map();

    initialErpRealizedEntries
      .filter((entry) => entry.companyId === selectedCompany.id)
      .forEach((entry) => {
        const costCenter = initialCostCenters.find((item) => item.id === entry.costCenterId);
        const account = initialAccounts.find((item) => item.id === entry.accountId);

        if (!costCenter || !account) {
          return;
        }

        const current = groups.get(costCenter.id) || {
          cr: costCenter,
          items: [],
          value: 0
        };
        const value = sumValuesInPeriod(entry.monthlyValues, period);

        current.items.push({ ...entry, account, value });
        current.value += value;
        groups.set(costCenter.id, current);
      });

    return Array.from(groups.values());
  }, [period, selectedCompany]);

  function selectCompanyGroup(group) {
    setSelectedCompanyGroup(group);
    setSelectedCompany(null);
    setExpandedCrId(null);
  }

  function selectCompany(company) {
    setSelectedCompany(company);
    setExpandedCrId(null);
  }

  function backToCompanies() {
    setSelectedCompany(null);
    setExpandedCrId(null);
  }

  function backToGroups() {
    setSelectedCompanyGroup(null);
    setSelectedCompany(null);
    setExpandedCrId(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Consulta ERP"
        title="Realizado"
        description="Consulte os valores realizados no ERP por grupo, empresa, centro de resultado, conta e mês."
      />

      <PeriodFilter period={period} onApply={setPeriod} />

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Database className="h-5 w-5 shrink-0" strokeWidth={2.2} />
        <span><strong>Dados do ERP Sankhya.</strong></span>
      </div>

      {!selectedCompanyGroup && !selectedCompany && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companyGroupSummaries.map((summary) => (
            <RealizedGroupSummaryCard
              key={summary.group.id}
              summary={summary}
              periodLabel={periodLabel}
              onClick={() => selectCompanyGroup(summary.group)}
            />
          ))}
        </section>
      )}

      {selectedCompanyGroup && !selectedCompany && (
        <section className="grid gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Grupo empresarial</span>
              <h2 className="text-xl font-extrabold text-akrus-900">{selectedCompanyGroup.name}</h2>
              <p className="text-sm text-slate-500">Selecione uma empresa para consultar o realizado importado do ERP.</p>
            </div>
            <Button variant="secondary" onClick={backToGroups}>Voltar para grupos</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companySummaries.map((summary) => (
              <RealizedCompanyCard
                key={summary.company.id}
                summary={summary}
                periodLabel={periodLabel}
                onClick={() => selectCompany(summary.company)}
              />
            ))}
          </div>
        </section>
      )}

      {selectedCompany && groupedRealized.length === 0 && (
        <section className="app-panel grid min-h-[260px] place-items-center p-8 text-center">
          <div>
            <h2 className="text-xl font-extrabold text-akrus-900">
              Nenhum realizado encontrado para {selectedCompany.code} - {selectedCompany.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">O ERP ainda não retornou movimentos para esta empresa.</p>
            <Button className="mt-5" variant="secondary" onClick={backToCompanies}>
              Voltar para empresas de {selectedCompanyGroup?.name}
            </Button>
          </div>
        </section>
      )}

      {selectedCompany && groupedRealized.length > 0 && (
        <section className="grid gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-akrus-900">
                {selectedCompany.code} - {selectedCompany.name}
              </h2>
              <p className="text-sm text-slate-500">{selectedCompanyGroup?.name} / Empresa / Realizado por centro de resultado</p>
            </div>
            <Button variant="secondary" onClick={backToCompanies}>
              Voltar para empresas de {selectedCompanyGroup?.name}
            </Button>
          </div>

          {groupedRealized.map((group) => (
            <RealizedCostCenterCard
              key={group.cr.id}
              group={group}
              expanded={expandedCrId === group.cr.id}
              onToggle={() => setExpandedCrId((current) => (current === group.cr.id ? null : group.cr.id))}
              monthIndexes={monthIndexes}
              periodLabel={periodLabel}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function RealizedGroupSummaryCard({ summary, periodLabel, onClick }) {
  return (
    <button className="app-panel grid gap-4 p-5 text-left transition hover:border-akrus/25 hover:bg-slate-50" type="button" onClick={onClick}>
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
      <RealizedTotal value={summary.value} label={`Realizado do grupo · ${periodLabel}`} />
    </button>
  );
}

function RealizedCompanyCard({ summary, periodLabel, onClick }) {
  return (
    <button className="app-panel grid gap-4 p-5 text-left transition hover:border-akrus/25 hover:bg-slate-50" type="button" onClick={onClick}>
      <div>
        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Empresa</span>
        <strong className="mt-1 block text-xl text-akrus-900">{summary.company.code} - {summary.company.name}</strong>
        <span className="text-sm text-slate-500">{summary.company.systemName}</span>
      </div>
      <RealizedTotal value={summary.value} label={`Realizado · ${periodLabel}`} />
    </button>
  );
}

function RealizedTotal({ value, label }) {
  return (
    <div className="border-t border-slate-200 pt-4">
      <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <strong className="text-lg text-akrus-900">{money.format(value)}</strong>
    </div>
  );
}

function RealizedCostCenterCard({ group, expanded, onToggle, monthIndexes, periodLabel }) {
  const [expandedAccountId, setExpandedAccountId] = useState(null);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center"
        type="button"
        onClick={onToggle}
      >
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Centro de resultado</span>
          <strong className="block text-sm text-akrus-900">{group.cr.code} - {group.cr.name}</strong>
        </div>
        <SummaryStat label="Contas" value={group.items.length} />
        <SummaryStat label={`Realizado · ${periodLabel}`} value={money.format(group.value)} />
        <span className="text-xl font-bold text-akrus md:text-right">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-[620px] w-full border-collapse text-sm">
              <thead className="bg-white text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-3 text-left">Conta</th>
                  <th className="px-3 py-3 text-right">Realizado</th>
                  <th className="px-3 py-3 text-right">Detalhar</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => {
                  const accountExpanded = expandedAccountId === item.id;

                  return (
                    <Fragment key={item.id}>
                      <tr
                        className="cursor-pointer border-t border-slate-200 transition hover:bg-slate-50"
                        onClick={() => setExpandedAccountId((current) => (current === item.id ? null : item.id))}
                        title="Clique para visualizar o realizado mês a mês"
                      >
                        <td className="px-3 py-3 font-bold text-akrus-900">{item.account.code} - {item.account.name}</td>
                        <td className="px-3 py-3 text-right font-bold text-akrus-900">{money.format(item.value)}</td>
                        <td className="px-3 py-3 text-right">
                          <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-akrus-50 font-extrabold text-akrus">
                            {accountExpanded ? "−" : "+"}
                          </span>
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

function SummaryStat({ label, value }) {
  return (
    <span>
      <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <strong className="text-base text-akrus-900">{value}</strong>
    </span>
  );
}
