import Button from "./Button.jsx";

export default function EntityForm({
  title,
  description,
  searchLabel,
  nameLabel,
  searchPlaceholder,
  namePlaceholder,
  suggestions,
  form,
  editingItem,
  onChange,
  onClose,
  onSave
}) {
  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(form.systemName.toLowerCase())
  );

  return (
    <section className="app-panel grid gap-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-akrus-900">{editingItem ? `Editar ${title.toLowerCase()}` : title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="form-label">{searchLabel}</span>
          <input
            className="form-input"
            value={form.systemName}
            onChange={(event) => onChange({ ...form, systemName: event.target.value })}
            placeholder={searchPlaceholder}
            list="system-options"
          />
          <datalist id="system-options">
            {filteredSuggestions.map((item) => (
              <option value={item} key={item} />
            ))}
          </datalist>
        </label>

        <label className="grid gap-2">
          <span className="form-label">{nameLabel}</span>
          <input
            className="form-input"
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            placeholder={namePlaceholder}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave}>{editingItem ? "Salvar alterações" : "Adicionar ao grid"}</Button>
      </div>
    </section>
  );
}
