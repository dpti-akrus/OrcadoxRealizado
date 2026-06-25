import { ChevronRight, Database } from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PeriodFilter from "../components/PeriodFilter.jsx";
import { fullYearPeriod } from "../utils/monthPeriod.js";

function noop() {
  // TODO: implementar consulta real de realizado futuramente.
}

export default function RealizadoPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Consulta ERP"
        title="Realizado"
        description="Casca visual preservada sem consulta, mock ou calculo de realizado."
      />

      <PeriodFilter period={fullYearPeriod} onApply={noop} disabled />

      <div className="mb-5 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Database className="h-5 w-5 shrink-0" strokeWidth={2.2} />
        <span><strong>Consulta desativada nesta etapa.</strong> A regra sera reconstruida a partir das tabelas reais.</span>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="app-panel grid gap-4 border-dashed p-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Grupo empresarial</span>
              <strong className="mt-1 block text-xl text-akrus-900">Nenhum grupo carregado.</strong>
              <span className="text-sm text-slate-500">Sem dados reais ou mockados.</span>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-akrus-50 text-akrus opacity-60">
              <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
            </span>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Realizado</span>
            <strong className="text-lg text-akrus-900">R$ 0,00</strong>
          </div>
        </article>
      </section>

      <section className="app-panel mt-5 grid min-h-[220px] place-items-center p-8 text-center">
        <div>
          <h2 className="text-xl font-extrabold text-akrus-900">Nenhum realizado carregado.</h2>
          <p className="mt-1 text-sm text-slate-500">A regra sera reconstruida a partir das tabelas reais.</p>
          <Button className="mt-5" variant="secondary" onClick={noop} disabled>Voltar para grupos</Button>
        </div>
      </section>
    </div>
  );
}
