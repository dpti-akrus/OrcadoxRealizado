import { useState } from "react";
import { CalendarRange, ChevronDown, X } from "lucide-react";
import { months } from "../data/mockData.js";
import { fullYearPeriod, getPeriodLabel } from "../utils/monthPeriod.js";
import Button from "./Button.jsx";

export default function PeriodFilter({ period, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftPeriod, setDraftPeriod] = useState(period);
  const isFiltered = period.startMonth !== 0 || period.endMonth !== 11;

  function openFilter() {
    setDraftPeriod(period);
    setIsOpen((current) => !current);
  }

  function updateStartMonth(value) {
    const startMonth = Number(value);
    setDraftPeriod((current) => ({
      startMonth,
      endMonth: Math.max(startMonth, current.endMonth)
    }));
  }

  function updateEndMonth(value) {
    setDraftPeriod((current) => ({ ...current, endMonth: Number(value) }));
  }

  function applyFilter() {
    onApply(draftPeriod);
    setIsOpen(false);
  }

  function clearFilter() {
    setDraftPeriod(fullYearPeriod);
    onApply(fullYearPeriod);
    setIsOpen(false);
  }

  return (
    <section className="relative mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={isFiltered ? "primary" : "secondary"} onClick={openFilter} aria-expanded={isOpen}>
          <span className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" strokeWidth={2.2} />
            Filtrar visualização: {getPeriodLabel(period)}
            <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.2} />
          </span>
        </Button>

        {isFiltered && (
          <button
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-akrus"
            type="button"
            onClick={clearFilter}
          >
            <X className="h-4 w-4" strokeWidth={2.2} />
            Limpar filtro
          </button>
        )}
      </div>

      {isOpen && (
        <div className="app-panel absolute left-0 top-full z-40 mt-2 grid w-full max-w-lg gap-4 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="grid gap-1.5">
            <span className="form-label">Mês inicial</span>
            <select className="form-input" value={draftPeriod.startMonth} onChange={(event) => updateStartMonth(event.target.value)}>
              {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="form-label">Mês final</span>
            <select className="form-input" value={draftPeriod.endMonth} onChange={(event) => updateEndMonth(event.target.value)}>
              {months.map((month, index) => (
                <option key={month} value={index} disabled={index < draftPeriod.startMonth}>{month}</option>
              ))}
            </select>
          </label>

          <Button onClick={applyFilter}>Aplicar</Button>
        </div>
      )}
    </section>
  );
}
