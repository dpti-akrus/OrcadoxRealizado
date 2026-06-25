import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Eye, FileText, Pencil, Plus, Power, X } from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import {
  alterarStatusOrcamento,
  criarLancamentoOrcamentario,
  criarOrcamentoAnual,
  editarLancamentoOrcamentario,
  inativarLancamentoOrcamentario,
  listarCentrosResultadoOrcamento,
  listarContasContabeisOrcamento,
  listarEmpresasOrcamento,
  listarLancamentosPorOrcamento,
  listarOrcamentos,
  obterPreviewSincronizacaoTcbmet,
  sincronizarTcbmetOrcamento
} from "../services/orcamentoService.js";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const emptyForm = { exercicio: "", codProj: "", observacao: "" };
const emptyLancamentoForm = {
  idOrcLanc: "",
  idOrcEmp: "",
  idOrcCus: "",
  idOrcCta: "",
  mes: "",
  vlrOrcado: "",
  descrLanc: "",
  observacao: "",
  origem: "M"
};

const meses = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

function statusClasses(status) {
  if (status === "O") return "bg-emerald-50 text-emerald-700";
  if (status === "E") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-500";
}

function formatDate(value) {
  if (!value) return "-";
  return String(value);
}

function EmptyPanel({ title, description }) {
  return (
    <div className="border-t border-slate-200 px-5 py-8 text-center">
      <strong className="block text-akrus-900">{title}</strong>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function OrcamentoCard({ orcamento, selected, onSelect }) {
  return (
    <button
      className={`grid w-full gap-4 border-t border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[1fr_170px_130px_120px_auto] md:items-center ${selected ? "bg-akrus-50/50" : "bg-white"}`}
      type="button"
      onClick={() => onSelect(orcamento)}
    >
      <span className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-akrus-50 text-akrus">
          <CalendarDays className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span>
          <strong className="block text-base text-akrus-900">Orcamento {orcamento.exercicio}</strong>
          <small className="text-slate-500">NUORC {orcamento.nuorc}</small>
        </span>
      </span>

      <span className="md:text-right">
        <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Valor total</span>
        <strong className="text-sm text-akrus-900">{money.format(orcamento.vlrOrcado)}</strong>
      </span>

      <span className="md:text-right">
        <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Lancamentos</span>
        <strong className="text-sm text-akrus-900">{orcamento.qtdLanc}</strong>
      </span>

      <span className="md:text-center">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${statusClasses(orcamento.status)}`}>
          {orcamento.statusDesc}
        </span>
      </span>

      <span className="md:text-right">
        <span className="inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus">
          <Eye className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </span>
    </button>
  );
}

function DetailItem({ label, value }) {
  const displayValue = value === 0 ? "0" : value || "-";

  return (
    <span>
      <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      <strong className="text-sm text-akrus-900">{displayValue}</strong>
    </span>
  );
}

function validarFormulario(form) {
  const exercicio = String(form.exercicio || "").trim();
  const codProj = String(form.codProj || "").trim();

  if (!/^\d{4}$/.test(exercicio)) return "Informe um exercicio valido com 4 digitos.";
  if (codProj && !/^\d+$/.test(codProj)) return "CODPROJ deve ser um numero inteiro.";
  return "";
}

function validarLancamentoForm(form, selectedOrcamento) {
  if (!selectedOrcamento) return "Selecione um orcamento para adicionar lancamento.";
  if (selectedOrcamento.status !== "E") return "Orcamento oficial. Nao e permitido lancar.";
  if (!/^\d+$/.test(String(form.idOrcEmp || "")) || Number(form.idOrcEmp) <= 0) return "Selecione a empresa.";
  if (!/^\d+$/.test(String(form.idOrcCus || "")) || Number(form.idOrcCus) <= 0) return "Selecione o centro de resultado.";
  if (!/^\d+$/.test(String(form.idOrcCta || "")) || Number(form.idOrcCta) <= 0) return "Selecione a conta contabil.";
  if (!/^\d+$/.test(String(form.mes || "")) || Number(form.mes) < 1 || Number(form.mes) > 12) return "Informe um mes valido entre 1 e 12.";

  const valor = Number(String(form.vlrOrcado ?? "").replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(valor) || valor < 0) return "Informe um valor orcado maior ou igual a zero.";

  return "";
}

function optionLabel(codigo, descricao, fallback) {
  const codigoTexto = codigo ? String(codigo) : "";
  const descricaoTexto = descricao || fallback || "";
  return [codigoTexto, descricaoTexto].filter(Boolean).join(" - ");
}

function LancamentosTable({ lancamentos, canEdit, onEdit, onInactivate }) {
  const linhas = lancamentos.filter((lancamento) => Number(lancamento.idOrcLanc) > 0);
  if (!linhas.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-[980px] w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-3 py-3 text-left">Lancamento</th>
            <th className="px-3 py-3 text-left">Empresa</th>
            <th className="px-3 py-3 text-left">Centro resultado</th>
            <th className="px-3 py-3 text-left">Conta contabil</th>
            <th className="px-3 py-3 text-left">Mes</th>
            <th className="px-3 py-3 text-right">Valor</th>
            <th className="px-3 py-3 text-left">Origem</th>
            <th className="px-3 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((lancamento) => (
            <tr key={lancamento.idOrcLanc} className="border-t border-slate-200 transition hover:bg-slate-50">
              <td className="px-3 py-3">
                <strong className="block text-akrus-900">{lancamento.descrLanc || `ID ${lancamento.idOrcLanc}`}</strong>
                <span className="text-xs text-slate-500">IDORCLANC {lancamento.idOrcLanc}</span>
              </td>
              <td className="px-3 py-3 text-slate-700">
                <strong className="block text-akrus-900">{lancamento.empresa || "-"}</strong>
                <span className="text-xs text-slate-500">IDORCEMP {lancamento.idOrcEmp || "-"}</span>
              </td>
              <td className="px-3 py-3 text-slate-700">
                <strong className="block text-akrus-900">{lancamento.centroResultado || "-"}</strong>
                <span className="text-xs text-slate-500">IDORCCUS {lancamento.idOrcCus || "-"}</span>
              </td>
              <td className="px-3 py-3 text-slate-700">
                <strong className="block text-akrus-900">{lancamento.contaContabil || "-"}</strong>
                <span className="text-xs text-slate-500">IDORCCTA {lancamento.idOrcCta || "-"}</span>
              </td>
              <td className="px-3 py-3 font-semibold text-slate-700">{lancamento.mesDesc || lancamento.mes || "-"}</td>
              <td className="px-3 py-3 text-right font-bold tabular-nums text-akrus-900">{money.format(lancamento.vlrOrcado)}</td>
              <td className="px-3 py-3 text-slate-600">{lancamento.origem || "-"}</td>
              <td className="px-3 py-3">
                <span className="flex justify-end gap-2">
                  <button
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus transition hover:border-akrus/40 disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() => onEdit(lancamento)}
                    disabled={!canEdit}
                    title="Editar lancamento"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() => onInactivate(lancamento)}
                    disabled={!canEdit}
                    title="Inativar lancamento"
                  >
                    <Power className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OrcamentoAnualPage({ currentUser = {}, permissions = {} }) {
  const isAdmin = Boolean(permissions.isAdmin);
  const perfilCarregado = Boolean(permissions.perfilCarregado);
  const codusuCarregado = Number(currentUser?.id || currentUser?.perfil?.codusu || 0);
  const tipoUsuario = String(currentUser?.perfil?.tipo || "G").toUpperCase();
  const isDiretoria = tipoUsuario === "D";
  const [orcamentos, setOrcamentos] = useState([]);
  const [selectedNuorc, setSelectedNuorc] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [empresasOrcamento, setEmpresasOrcamento] = useState([]);
  const [centrosResultadoOrcamento, setCentrosResultadoOrcamento] = useState([]);
  const [contasContabeisOrcamento, setContasContabeisOrcamento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLancamentos, setLoadingLancamentos] = useState(false);
  const [loadingAuxiliares, setLoadingAuxiliares] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingLancamento, setSavingLancamento] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sincronizandoTcbmet, setSincronizandoTcbmet] = useState(false);
  const [carregandoPreviewTcbmet, setCarregandoPreviewTcbmet] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [lancamentoModalOpen, setLancamentoModalOpen] = useState(false);
  const [tcbmetModalOpen, setTcbmetModalOpen] = useState(false);
  const [previewTcbmet, setPreviewTcbmet] = useState(null);
  const [editingLancamento, setEditingLancamento] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [lancamentoForm, setLancamentoForm] = useState(emptyLancamentoForm);
  const [error, setError] = useState("");
  const [lancamentosError, setLancamentosError] = useState("");
  const [auxiliaresError, setAuxiliaresError] = useState("");
  const [formError, setFormError] = useState("");
  const [lancamentoFormError, setLancamentoFormError] = useState("");
  const [tcbmetError, setTcbmetError] = useState("");
  const [tcbmetSuccess, setTcbmetSuccess] = useState("");

  const selectedOrcamento = useMemo(
    () => orcamentos.find((orcamento) => orcamento.nuorc === selectedNuorc) || null,
    [orcamentos, selectedNuorc]
  );
  const podeAdicionarLancamento = selectedOrcamento?.status === "E";
  const semCentroPermitido = !isAdmin && !loadingAuxiliares && centrosResultadoOrcamento.length === 0;
  const mensagemSemCentro = isDiretoria
    ? "Usuário Diretoria sem centro de resultado vinculado. Visualização liberada, mas lançamento bloqueado."
    : "Usuário sem centro de resultado vinculado. Solicite acesso ao administrador.";
  const statusActionLabel = selectedOrcamento?.status === "O" ? "Reabrir Orcamento" : "Tornar Oficial";

  async function carregarLancamentos(nuorc = selectedNuorc) {
    if (!nuorc) {
      setLancamentos([]);
      setLancamentosError("");
      return;
    }

    try {
      setLoadingLancamentos(true);
      setLancamentosError("");
      const dados = await listarLancamentosPorOrcamento(nuorc);
      setLancamentos(dados);
    } catch (erro) {
      setLancamentos([]);
      setLancamentosError(erro?.message || "Nao foi possivel carregar os lancamentos.");
    } finally {
      setLoadingLancamentos(false);
    }
  }

  async function carregarOrcamentos({ manterSelecao = true } = {}) {
    try {
      setLoading(true);
      setError("");
      const dados = await listarOrcamentos();
      setOrcamentos(dados);
      setSelectedNuorc((current) => {
        if (manterSelecao && dados.some((orcamento) => orcamento.nuorc === current)) return current;
        return null;
      });
    } catch (erro) {
      setOrcamentos([]);
      setSelectedNuorc(null);
      setError(erro?.message || "Nao foi possivel carregar os orcamentos.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarAuxiliaresOrcamento() {
    try {
      setLoadingAuxiliares(true);
      setAuxiliaresError("");
      const [empresas, centros, contas] = await Promise.all([
        listarEmpresasOrcamento(),
        listarCentrosResultadoOrcamento(),
        listarContasContabeisOrcamento()
      ]);
      setEmpresasOrcamento(empresas);
      setCentrosResultadoOrcamento(centros);
      setContasContabeisOrcamento(contas);
    } catch (erro) {
      setEmpresasOrcamento([]);
      setCentrosResultadoOrcamento([]);
      setContasContabeisOrcamento([]);
      setAuxiliaresError(erro?.message || "Nao foi possivel carregar empresas, centros e contas.");
    } finally {
      setLoadingAuxiliares(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function carregarInicial() {
      if (!perfilCarregado) {
        setLoading(true);
        return;
      }

      if (!codusuCarregado) {
        setOrcamentos([]);
        setSelectedNuorc(null);
        setError("Nao foi possivel identificar o usuario logado para carregar os orcamentos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const dados = await listarOrcamentos();
        if (!active) return;
        setOrcamentos(dados);
        setSelectedNuorc(null);
      } catch (erro) {
        if (!active) return;
        setOrcamentos([]);
        setSelectedNuorc(null);
        setError(erro?.message || "Nao foi possivel carregar os orcamentos.");
      } finally {
        if (active) setLoading(false);
      }
    }

    carregarInicial();

    return () => {
      active = false;
    };
  }, [perfilCarregado, codusuCarregado, tipoUsuario]);

  useEffect(() => {
    if (!perfilCarregado || !codusuCarregado) return;
    carregarAuxiliaresOrcamento();
  }, [perfilCarregado, codusuCarregado, tipoUsuario]);

  useEffect(() => {
    let active = true;

    async function carregar() {
      if (!selectedNuorc) {
        setLancamentos([]);
        setLancamentosError("");
        return;
      }

      try {
        setLoadingLancamentos(true);
        setLancamentosError("");
        const dados = await listarLancamentosPorOrcamento(selectedNuorc);
        if (active) setLancamentos(dados);
      } catch (erro) {
        if (!active) return;
        setLancamentos([]);
        setLancamentosError(erro?.message || "Nao foi possivel carregar os lancamentos.");
      } finally {
        if (active) setLoadingLancamentos(false);
      }
    }

    carregar();

    return () => {
      active = false;
    };
  }, [selectedNuorc]);

  function openModal() {
    if (!isAdmin) {
      setFormError("Você não possui permissão para executar esta ação.");
      return;
    }

    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setForm(emptyForm);
    setFormError("");
  }

  function openLancamentoModal() {
    if (!selectedOrcamento) return;
    if (!podeAdicionarLancamento) {
      setLancamentoFormError("Orcamento oficial. Nao e permitido lancar.");
      return;
    }
    if (semCentroPermitido) {
      setLancamentosError(mensagemSemCentro);
      return;
    }
    if (!empresasOrcamento.length || !centrosResultadoOrcamento.length || !contasContabeisOrcamento.length) {
      carregarAuxiliaresOrcamento();
    }
    setLancamentoForm(emptyLancamentoForm);
    setEditingLancamento(null);
    setLancamentoFormError("");
    setLancamentoModalOpen(true);
  }

  function openEditLancamentoModal(lancamento) {
    if (!selectedOrcamento) return;
    if (!podeAdicionarLancamento) {
      setLancamentosError("Orcamento oficial. Nao e permitido alterar lancamentos.");
      return;
    }
    if (semCentroPermitido) {
      setLancamentosError(mensagemSemCentro);
      return;
    }
    if (!empresasOrcamento.length || !centrosResultadoOrcamento.length || !contasContabeisOrcamento.length) {
      carregarAuxiliaresOrcamento();
    }

    setEditingLancamento(lancamento);
    setLancamentoForm({
      idOrcLanc: String(lancamento.idOrcLanc || ""),
      idOrcEmp: String(lancamento.idOrcEmp || ""),
      idOrcCus: String(lancamento.idOrcCus || ""),
      idOrcCta: String(lancamento.idOrcCta || ""),
      mes: String(lancamento.mes || ""),
      vlrOrcado: String(lancamento.vlrOrcado ?? ""),
      descrLanc: lancamento.descrLanc || "",
      observacao: lancamento.observacao || "",
      origem: lancamento.origem || "M"
    });
    setLancamentoFormError("");
    setLancamentoModalOpen(true);
  }

  function closeLancamentoModal() {
    if (savingLancamento) return;
    setLancamentoModalOpen(false);
    setEditingLancamento(null);
    setLancamentoForm(emptyLancamentoForm);
    setLancamentoFormError("");
  }

  async function openTcbmetModal() {
    if (!selectedOrcamento || carregandoPreviewTcbmet || sincronizandoTcbmet) return;

    if (selectedOrcamento.status !== "O") {
      setLancamentosError("Somente orçamentos oficiais podem ser sincronizados com a TCBMET.");
      return;
    }

    try {
      setCarregandoPreviewTcbmet(true);
      setLancamentosError("");
      setTcbmetError("");
      setTcbmetSuccess("");
      const preview = await obterPreviewSincronizacaoTcbmet(selectedOrcamento.nuorc);
      setPreviewTcbmet({
        ...preview,
        exercicio: selectedOrcamento.exercicio
      });
      setTcbmetModalOpen(true);
    } catch (erro) {
      setLancamentosError(erro?.message || "Erro ao sincronizar com a TCBMET. Verifique os dados e tente novamente.");
    } finally {
      setCarregandoPreviewTcbmet(false);
    }
  }

  function closeTcbmetModal() {
    if (sincronizandoTcbmet) return;
    setTcbmetModalOpen(false);
    setPreviewTcbmet(null);
    setTcbmetError("");
  }

  async function confirmarSincronizacaoTcbmet() {
    if (!selectedOrcamento || sincronizandoTcbmet) return;

    try {
      setSincronizandoTcbmet(true);
      setTcbmetError("");
      setTcbmetSuccess("");
      const resultado = await sincronizarTcbmetOrcamento(selectedOrcamento.nuorc);
      setPreviewTcbmet({
        ...resultado,
        exercicio: selectedOrcamento.exercicio
      });
      setTcbmetSuccess("Sincronização concluída com sucesso.");
      await carregarOrcamentos({ manterSelecao: true });
      await carregarLancamentos(selectedOrcamento.nuorc);
    } catch (erro) {
      setTcbmetError(erro?.message || "Erro ao sincronizar com a TCBMET. Verifique os dados e tente novamente.");
    } finally {
      setSincronizandoTcbmet(false);
    }
  }

  async function saveOrcamento(event) {
    event.preventDefault();

    if (!isAdmin) {
      setFormError("Você não possui permissão para executar esta ação.");
      return;
    }

    const erroFormulario = validarFormulario(form);

    if (erroFormulario) {
      setFormError(erroFormulario);
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      const criado = await criarOrcamentoAnual(form);
      setModalOpen(false);
      setForm(emptyForm);
      await carregarOrcamentos({ manterSelecao: false });
      setSelectedNuorc(criado.nuorc);
    } catch (erro) {
      setFormError(erro?.message || "Nao foi possivel criar o orcamento.");
    } finally {
      setSaving(false);
    }
  }

  async function saveLancamento(event) {
    event.preventDefault();
    const erroFormulario = validarLancamentoForm(lancamentoForm, selectedOrcamento);

    if (erroFormulario) {
      setLancamentoFormError(erroFormulario);
      return;
    }

    try {
      setSavingLancamento(true);
      setLancamentoFormError("");
      const payload = {
        nuorc: selectedOrcamento.nuorc,
        ...lancamentoForm
      };

      if (editingLancamento) {
        await editarLancamentoOrcamentario(payload);
      } else {
        await criarLancamentoOrcamentario(payload);
      }

      setLancamentoModalOpen(false);
      setEditingLancamento(null);
      setLancamentoForm(emptyLancamentoForm);
      await carregarLancamentos(selectedOrcamento.nuorc);
      await carregarOrcamentos({ manterSelecao: true });
    } catch (erro) {
      setLancamentoFormError(erro?.message || "Nao foi possivel criar o lancamento.");
    } finally {
      setSavingLancamento(false);
    }
  }

  async function inactivateLancamento(lancamento) {
    if (!selectedOrcamento || savingLancamento) return;

    if (!podeAdicionarLancamento) {
      setLancamentosError("Orcamento oficial. Nao e permitido alterar lancamentos.");
      return;
    }

    if (!window.confirm("Deseja inativar este lancamento?")) return;

    try {
      setSavingLancamento(true);
      setLancamentosError("");
      await inativarLancamentoOrcamentario({
        idOrcLanc: lancamento.idOrcLanc,
        nuorc: selectedOrcamento.nuorc
      });
      await carregarLancamentos(selectedOrcamento.nuorc);
      await carregarOrcamentos({ manterSelecao: true });
    } catch (erro) {
      setLancamentosError(erro?.message || "Nao foi possivel inativar o lancamento.");
    } finally {
      setSavingLancamento(false);
    }
  }

  async function toggleStatusOrcamento() {
    if (!selectedOrcamento || savingStatus) return;

    if (!isAdmin) {
      setLancamentosError(
        selectedOrcamento.status === "O"
          ? "Apenas administradores podem reabrir orçamento oficial."
          : "Você não possui permissão para executar esta ação."
      );
      return;
    }

    const novoStatus = selectedOrcamento.status === "O" ? "E" : "O";
    const mensagem = novoStatus === "O"
      ? `Deseja tornar oficial o orcamento ${selectedOrcamento.exercicio}?`
      : `Deseja reabrir o orcamento ${selectedOrcamento.exercicio}?`;

    if (!window.confirm(mensagem)) return;

    try {
      setSavingStatus(true);
      setError("");
      setLancamentosError("");
      await alterarStatusOrcamento(selectedOrcamento.nuorc, novoStatus);
      await carregarOrcamentos({ manterSelecao: true });
      await carregarLancamentos(selectedOrcamento.nuorc);
      if (novoStatus === "O") {
        setLancamentoModalOpen(false);
        setEditingLancamento(null);
        setLancamentoForm(emptyLancamentoForm);
        setLancamentoFormError("");
      }
    } catch (erro) {
      setLancamentosError(erro?.message || "Nao foi possivel alterar o status do orcamento.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Gestao orcamentaria"
        title="Orcamento"
        description="Visualize os orcamentos anuais cadastrados e seus resumos de lancamentos."
      />

      <section className="app-panel mb-5 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <strong className="block text-base text-akrus-900">Orcamentos anuais</strong>
          <span className="text-sm text-slate-500">Listagem real da AD_ORCAMENTO com resumo da AD_ORCLANC.</span>
        </div>
        {isAdmin && (
          <Button onClick={openModal}>
            <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Novo Orcamento</span>
          </Button>
        )}
      </section>

      {error && <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle className="h-5 w-5 shrink-0" strokeWidth={2.2} /><span>{error}</span></div>}

      <section className="app-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_170px_130px_120px_auto] bg-slate-50 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">
          <span>Orcamento</span><span className="text-right">Valor total</span><span className="text-right">Lancamentos</span><span className="text-center">Status</span><span></span>
        </div>
        {loading && <EmptyPanel title="Carregando orcamentos..." description="Consultando dados reais da AD_ORCAMENTO." />}
        {!loading && !error && orcamentos.length === 0 && <EmptyPanel title="Nenhum orcamento cadastrado." description="Crie um novo orcamento anual para iniciar a reconstrucao do modulo." />}
        {!loading && !error && orcamentos.map((orcamento) => (
          <OrcamentoCard key={orcamento.nuorc} orcamento={orcamento} selected={orcamento.nuorc === selectedNuorc} onSelect={(item) => setSelectedNuorc(item.nuorc)} />
        ))}
      </section>

      <section className="app-panel mt-5 grid gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-akrus-50 text-akrus"><FileText className="h-5 w-5" strokeWidth={2.2} /></span>
          <div>
            <strong className="block text-akrus-900">Detalhe do orcamento</strong>
            <span className="text-sm text-slate-500">{selectedOrcamento ? "Orcamento selecionado. Visualize os lancamentos vinculados a este orcamento." : "Selecione um orcamento para visualizar os lancamentos."}</span>
          </div>
        </div>

        {!selectedOrcamento && <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">Selecione um orcamento para visualizar os lancamentos.</p>}

        {selectedOrcamento && (
          <>
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
              <DetailItem label="NUORC" value={selectedOrcamento.nuorc} />
              <DetailItem label="Exercicio" value={selectedOrcamento.exercicio} />
              <DetailItem label="Status" value={selectedOrcamento.statusDesc} />
              <DetailItem label="Projeto" value={selectedOrcamento.codProj} />
              <DetailItem label="Valor orcado" value={money.format(selectedOrcamento.vlrOrcado)} />
              <DetailItem label="Lancamentos" value={selectedOrcamento.qtdLanc} />
              <DetailItem label="Criado em" value={formatDate(selectedOrcamento.dhInc)} />
              <DetailItem label="Alterado em" value={formatDate(selectedOrcamento.dhAlt)} />
              <div className="md:col-span-4"><span className="block text-xs font-extrabold uppercase tracking-wide text-slate-400">Observacao</span><p className="mt-1 text-sm font-semibold text-akrus-900">{selectedOrcamento.observacao || "-"}</p></div>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <strong className="block text-akrus-900">Lancamentos do orcamento</strong>
                  <span className="text-sm text-slate-500">Registros ativos da AD_ORCLANC vinculados ao NUORC {selectedOrcamento.nuorc}.</span>
                  {!podeAdicionarLancamento && <span className="mt-1 block text-sm font-semibold text-amber-700">Orcamento oficial. Nao e permitido alterar lancamentos.</span>}
                  {podeAdicionarLancamento && semCentroPermitido && <span className="mt-1 block text-sm font-semibold text-amber-700">{mensagemSemCentro}</span>}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {isAdmin && (
                    <Button variant="secondary" onClick={toggleStatusOrcamento} disabled={savingStatus}>
                      {savingStatus ? "Alterando..." : statusActionLabel}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      variant="secondary"
                      onClick={openTcbmetModal}
                      disabled={selectedOrcamento.status !== "O" || carregandoPreviewTcbmet || sincronizandoTcbmet}
                    >
                      {carregandoPreviewTcbmet ? "Preparando..." : "Sincronizar TCBMET"}
                    </Button>
                  )}
                  <Button variant="secondary" onClick={openLancamentoModal} disabled={!podeAdicionarLancamento || savingStatus || semCentroPermitido}>
                    + Adicionar lancamento
                  </Button>
                </div>
              </div>

              {lancamentosError && <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle className="h-5 w-5 shrink-0" strokeWidth={2.2} /><span>{lancamentosError}</span></div>}
              {loadingLancamentos && <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">Carregando lancamentos...</p>}
              {!loadingLancamentos && !lancamentosError && lancamentos.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">Nenhum lancamento cadastrado para este orcamento.</p>}
              {!loadingLancamentos && !lancamentosError && lancamentos.length > 0 && (
                <LancamentosTable
                  lancamentos={lancamentos}
                  canEdit={podeAdicionarLancamento && !savingLancamento && !savingStatus}
                  onEdit={openEditLancamentoModal}
                  onInactivate={inactivateLancamento}
                />
              )}
            </div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form className="w-full max-w-lg rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]" onSubmit={saveOrcamento}>
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold text-akrus-900">Novo Orcamento</h2><p className="mt-1 text-sm text-slate-500">Crie apenas o cabecalho anual em elaboracao.</p></div><button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-akrus" type="button" onClick={closeModal} aria-label="Fechar modal"><X className="h-5 w-5" strokeWidth={2.2} /></button></div>
            <div className="grid gap-4">
              <label className="grid gap-2"><span className="form-label">Exercicio *</span><input className="form-input" value={form.exercicio} onChange={(event) => setForm((current) => ({ ...current, exercicio: event.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="Ex: 2026" inputMode="numeric" required /></label>
              <label className="grid gap-2"><span className="form-label">CODPROJ</span><input className="form-input" value={form.codProj} onChange={(event) => setForm((current) => ({ ...current, codProj: event.target.value.replace(/\D/g, "") }))} placeholder="Opcional" inputMode="numeric" /></label>
              <label className="grid gap-2"><span className="form-label">Observacao</span><textarea className="form-input min-h-24 resize-y" value={form.observacao} onChange={(event) => setForm((current) => ({ ...current, observacao: event.target.value }))} placeholder="Opcional" /></label>
            </div>
            {formError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</p>}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end"><Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar orcamento"}</Button></div>
          </form>
        </div>
      )}

      {lancamentoModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]" onSubmit={saveLancamento}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-akrus-900">{editingLancamento ? "Editar lancamento" : "Adicionar lancamento"}</h2>
                <p className="mt-1 text-sm text-slate-500">NUORC {selectedOrcamento?.nuorc} - informe os IDs reais do lancamento mensal.</p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-akrus" type="button" onClick={closeLancamentoModal} aria-label="Fechar modal"><X className="h-5 w-5" strokeWidth={2.2} /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {editingLancamento && (
                <label className="grid gap-2"><span className="form-label">IDORCLANC</span><input className="form-input" value={lancamentoForm.idOrcLanc} readOnly /></label>
              )}
              <label className="grid gap-2">
                <span className="form-label">Empresa *</span>
                <select className="form-input" value={lancamentoForm.idOrcEmp} onChange={(event) => setLancamentoForm((current) => ({ ...current, idOrcEmp: event.target.value }))} disabled={loadingAuxiliares} required>
                  <option value="">{loadingAuxiliares ? "Carregando..." : "Selecione"}</option>
                  {empresasOrcamento.map((empresa) => (
                    <option key={empresa.idOrcEmp} value={empresa.idOrcEmp}>
                      {optionLabel(empresa.codEmp, empresa.nomeFantasia, `IDORCEMP ${empresa.idOrcEmp}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="form-label">Centro de Resultado *</span>
                <select className="form-input" value={lancamentoForm.idOrcCus} onChange={(event) => setLancamentoForm((current) => ({ ...current, idOrcCus: event.target.value }))} disabled={loadingAuxiliares} required>
                  <option value="">{loadingAuxiliares ? "Carregando..." : "Selecione"}</option>
                  {centrosResultadoOrcamento.map((centro) => (
                    <option key={centro.idOrcCus} value={centro.idOrcCus}>
                      {optionLabel(centro.codCencus, centro.descricao, `IDORCCUS ${centro.idOrcCus}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="form-label">Conta Contabil *</span>
                <select className="form-input" value={lancamentoForm.idOrcCta} onChange={(event) => setLancamentoForm((current) => ({ ...current, idOrcCta: event.target.value }))} disabled={loadingAuxiliares} required>
                  <option value="">{loadingAuxiliares ? "Carregando..." : "Selecione"}</option>
                  {contasContabeisOrcamento.map((conta) => (
                    <option key={conta.idOrcCta} value={conta.idOrcCta}>
                      {optionLabel(conta.codCtaCtb, conta.descricao, `IDORCCTA ${conta.idOrcCta}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2"><span className="form-label">Mes *</span><select className="form-input" value={lancamentoForm.mes} onChange={(event) => setLancamentoForm((current) => ({ ...current, mes: event.target.value }))} required><option value="">Selecione</option>{meses.map((mes, index) => <option key={mes} value={index + 1}>{index + 1} - {mes}</option>)}</select></label>
              <label className="grid gap-2"><span className="form-label">Valor orcado *</span><input className="form-input" value={lancamentoForm.vlrOrcado} onChange={(event) => setLancamentoForm((current) => ({ ...current, vlrOrcado: event.target.value }))} placeholder="0,00" inputMode="decimal" required /></label>
              <label className="grid gap-2"><span className="form-label">Origem</span><input className="form-input" value="M" readOnly /></label>
              <label className="grid gap-2 md:col-span-3"><span className="form-label">Descricao</span><input className="form-input" value={lancamentoForm.descrLanc} onChange={(event) => setLancamentoForm((current) => ({ ...current, descrLanc: event.target.value }))} placeholder="Opcional" /></label>
              <label className="grid gap-2 md:col-span-3"><span className="form-label">Observacao</span><textarea className="form-input min-h-24 resize-y" value={lancamentoForm.observacao} onChange={(event) => setLancamentoForm((current) => ({ ...current, observacao: event.target.value }))} placeholder="Opcional" /></label>
            </div>

            {auxiliaresError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{auxiliaresError}</p>}
            {lancamentoFormError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{lancamentoFormError}</p>}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" type="button" onClick={closeLancamentoModal} disabled={savingLancamento}>Cancelar</Button>
              <Button type="submit" disabled={savingLancamento || loadingAuxiliares || Boolean(auxiliaresError)}>{savingLancamento ? "Salvando..." : editingLancamento ? "Salvar alteracoes" : "Salvar lancamento"}</Button>
            </div>
          </form>
        </div>
      )}

      {tcbmetModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-akrus-900">Sincronizar TCBMET</h2>
                <p className="mt-1 text-sm text-slate-500">Confira o resumo antes de enviar os lançamentos ativos.</p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-akrus" type="button" onClick={closeTcbmetModal} aria-label="Fechar modal"><X className="h-5 w-5" strokeWidth={2.2} /></button>
            </div>

            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <DetailItem label="Exercicio" value={previewTcbmet?.exercicio} />
              <DetailItem label="NUORC" value={previewTcbmet?.nuorc} />
              <DetailItem label="Lancamentos ativos" value={previewTcbmet?.qtdLancamentos} />
              <DetailItem label="Combinacoes TCBMET" value={previewTcbmet?.qtdCombinacoes} />
              <DetailItem label="Valor total" value={money.format(previewTcbmet?.valorTotal || 0)} />
              {previewTcbmet?.inseridos !== undefined && <DetailItem label="Inseridos" value={previewTcbmet.inseridos} />}
              {previewTcbmet?.atualizados !== undefined && <DetailItem label="Atualizados" value={previewTcbmet.atualizados} />}
            </div>

            {tcbmetError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{tcbmetError}</p>}
            {tcbmetSuccess && <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{tcbmetSuccess}</p>}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" type="button" onClick={closeTcbmetModal} disabled={sincronizandoTcbmet}>Fechar</Button>
              <Button type="button" onClick={confirmarSincronizacaoTcbmet} disabled={sincronizandoTcbmet || Boolean(tcbmetSuccess)}>
                {sincronizandoTcbmet ? "Sincronizando..." : "Confirmar sincronizacao"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
