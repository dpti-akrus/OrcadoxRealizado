import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Button from "./Button.jsx";
import PageHeader from "./PageHeader.jsx";

function normalizar(valor) {
  return String(valor ?? "").toLowerCase();
}

function valorInicial(fields) {
  return fields.reduce((form, field) => {
    form[field.name] = field.type === "multiselect" ? [] : "";
    return form;
  }, { id: "" });
}

export default function AdminCrudPage({
  eyebrow = "Cadastros",
  title,
  description,
  addLabel,
  fields,
  columns,
  searchKeys,
  loadItems,
  saveItem,
  inactiveItem,
  loadOptions,
  loadExtraForEdit,
  emptyText = "Nenhum registro encontrado."
}) {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(() => valorInicial(fields));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const filteredItems = useMemo(() => {
    const busca = normalizar(query).trim();
    if (!busca) return items;
    return items.filter((item) => searchKeys.some((key) => normalizar(item[key]).includes(busca)));
  }, [items, query, searchKeys]);

  async function carregar() {
    try {
      setLoading(true);
      setError("");
      const [dados, opcoes] = await Promise.all([
        loadItems(),
        loadOptions ? loadOptions() : Promise.resolve({})
      ]);
      setItems(dados);
      setOptions(opcoes || {});
    } catch (erro) {
      setItems([]);
      setError(erro?.message || "Nao foi possivel carregar os registros.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function abrirNovo() {
    setEditing(null);
    setForm(valorInicial(fields));
    setFormError("");
    setModalOpen(true);
  }

  async function abrirEdicao(item) {
    try {
      setEditing(item);
      setFormError("");
      const extra = loadExtraForEdit ? await loadExtraForEdit(item) : {};
      const initial = valorInicial(fields);
      fields.forEach((field) => {
        if (field.type === "multiselect") {
          initial[field.name] = extra[field.name] || item[field.name] || [];
        } else {
          initial[field.name] = item[field.name] ?? "";
        }
      });
      initial.id = item.id;
      setForm(initial);
      setModalOpen(true);
    } catch (erro) {
      setError(erro?.message || "Nao foi possivel abrir o registro para edicao.");
    }
  }

  function fecharModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setForm(valorInicial(fields));
    setFormError("");
  }

  function atualizarCampo(nome, valor) {
    setForm((current) => ({ ...current, [nome]: valor }));
  }

  function alternarMulti(nome, valor) {
    setForm((current) => {
      const atuais = Array.isArray(current[nome]) ? current[nome] : [];
      const existe = atuais.includes(valor);
      return {
        ...current,
        [nome]: existe ? atuais.filter((item) => item !== valor) : [...atuais, valor]
      };
    });
  }

  async function salvar(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setFormError("");
      await saveItem(form);
      setModalOpen(false);
      setEditing(null);
      setForm(valorInicial(fields));
      await carregar();
    } catch (erro) {
      setFormError(erro?.message || "Nao foi possivel salvar o registro.");
    } finally {
      setSaving(false);
    }
  }

  async function inativar(item) {
    if (!window.confirm("Deseja excluir este registro? A ação fará inativação lógica.")) return;
    try {
      setSaving(true);
      setError("");
      await inactiveItem(item.id);
      await carregar();
    } catch (erro) {
      setError(erro?.message || "Nao foi possivel inativar o registro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="app-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="form-input pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por codigo ou descricao"
          />
        </span>
        <Button onClick={abrirNovo}>
          <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> {addLabel}</span>
        </Button>
      </section>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={2.2} />
          <span>{error}</span>
        </div>
      )}

      <section className="app-panel overflow-hidden">
        <div
          className="grid bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-400"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) 110px` }}
        >
          {columns.map((column) => <span key={column.key}>{column.label}</span>)}
          <span className="text-right">Acoes</span>
        </div>

        {loading && <p className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Carregando registros...</p>}
        {!loading && filteredItems.length === 0 && <p className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500">{emptyText}</p>}

        {!loading && filteredItems.map((item) => (
          <div
            key={item.id}
            className="grid items-center border-t border-slate-200 px-4 py-3 text-sm"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) 110px` }}
          >
            {columns.map((column) => (
              <span key={column.key} className={column.strong ? "font-bold text-akrus-900" : "text-slate-600"}>
                {column.render ? column.render(item) : item[column.key] || "-"}
              </span>
            ))}
            <span className="flex justify-end gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus" type="button" onClick={() => abrirEdicao(item)} title="Editar">
                <Pencil className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 bg-white text-red-600" type="button" onClick={() => inativar(item)} title="Excluir">
                <Trash2 className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </span>
          </div>
        ))}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <form className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]" onSubmit={salvar}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-akrus-900">{editing ? `Editar ${title}` : addLabel}</h2>
                <p className="mt-1 text-sm text-slate-500">Preencha os campos obrigatorios e salve o cadastro.</p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-akrus" type="button" onClick={fecharModal} aria-label="Fechar modal">
                <X className="h-5 w-5" strokeWidth={2.2} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.name} className={`grid gap-2 ${field.type === "multiselect" ? "md:col-span-2" : ""}`}>
                  <span className="form-label">{field.label}</span>
                  {field.type === "select" && (
                    <select className="form-input" value={form[field.name] ?? ""} onChange={(event) => atualizarCampo(field.name, event.target.value)} required={field.required}>
                      <option value="">Selecione</option>
                      {(options[field.optionsKey] || field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  )}
                  {field.type === "multiselect" && (
                    <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
                      {(options[field.optionsKey] || []).map((option) => (
                        <label key={option.value} className="flex items-center gap-2 py-1 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={(form[field.name] || []).includes(option.value)}
                            onChange={() => alternarMulti(field.name, option.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                      {(options[field.optionsKey] || []).length === 0 && <p className="text-sm text-slate-500">Nenhuma opcao disponivel.</p>}
                    </div>
                  )}
                  {!["select", "multiselect"].includes(field.type) && (
                    <input
                      className="form-input"
                      value={form[field.name] ?? ""}
                      onChange={(event) => atualizarCampo(field.name, field.numeric ? event.target.value.replace(/\D/g, "") : event.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      readOnly={field.readOnlyOnEdit && editing}
                    />
                  )}
                </label>
              ))}
            </div>

            {formError && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</p>}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" type="button" onClick={fecharModal} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
