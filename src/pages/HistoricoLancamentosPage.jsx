import { useEffect, useState } from "react";
import { AlertCircle, History } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { listarLancamentosInativos } from "../services/orcamentoService.js";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function usuarioLabel(codigo, nome) {
  const codigoTexto = codigo ? String(codigo) : "";
  const nomeTexto = nome || "";
  return [codigoTexto, nomeTexto].filter(Boolean).join(" - ") || "-";
}

export default function HistoricoLancamentosPage() {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function carregarHistorico() {
      try {
        setLoading(true);
        setError("");
        const dados = await listarLancamentosInativos();
        if (active) setLancamentos(dados);
      } catch (erro) {
        if (!active) return;
        setLancamentos([]);
        setError(erro?.message || "Nao foi possivel carregar o historico de lancamentos.");
      } finally {
        if (active) setLoading(false);
      }
    }

    carregarHistorico();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Gestao orcamentaria"
        title="Historico de Lancamentos"
        description="Lancamentos inativos da AD_ORCLANC para consulta administrativa."
      />

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      )}

      <section className="app-panel overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-akrus-50 text-akrus">
            <History className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <strong className="block text-akrus-900">Lancamentos inativos</strong>
            <span className="text-sm text-slate-500">Registros com ATIVA = N.</span>
          </div>
        </div>

        {loading && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Carregando historico...</p>
        )}

        {!loading && !error && lancamentos.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Nenhum lancamento inativo encontrado.</p>
        )}

        {!loading && !error && lancamentos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-3 text-left">Lancamento</th>
                  <th className="px-3 py-3 text-left">Orcamento</th>
                  <th className="px-3 py-3 text-left">Empresa</th>
                  <th className="px-3 py-3 text-left">Centro</th>
                  <th className="px-3 py-3 text-left">Conta</th>
                  <th className="px-3 py-3 text-left">Mes</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                  <th className="px-3 py-3 text-left">Desativado por</th>
                  <th className="px-3 py-3 text-left">Data de desativacao</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((lancamento) => (
                  <tr key={lancamento.idOrcLanc} className="border-t border-slate-200">
                    <td className="px-3 py-3">
                      <strong className="block text-akrus-900">{lancamento.descrLanc || `ID ${lancamento.idOrcLanc}`}</strong>
                      <span className="text-xs text-slate-500">IDORCLANC {lancamento.idOrcLanc}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      <strong className="block text-akrus-900">{lancamento.exercicio || "-"}</strong>
                      <span className="text-xs text-slate-500">NUORC {lancamento.nuorc || "-"}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{lancamento.empresa || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{lancamento.centroResultado || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{lancamento.contaContabil || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{lancamento.mesDesc || lancamento.mes || "-"}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-akrus-900">{money.format(lancamento.vlrOrcado)}</td>
                    <td className="px-3 py-3 text-slate-700">
                      {usuarioLabel(lancamento.codUsuDesativacao, lancamento.nomeUsuDesativacao)}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{lancamento.dhDesativacao || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
