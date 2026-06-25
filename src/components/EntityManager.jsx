import Button from "./Button.jsx";
import PageHeader from "./PageHeader.jsx";

function noop() {
  // TODO: implementar cadastro real futuramente.
}

export default function EntityManager({
  eyebrow,
  title,
  description,
  addLabel,
  formTitle,
  formDescription,
  searchLabel,
  nameLabel,
  searchPlaceholder,
  namePlaceholder
}) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="app-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input className="form-input sm:max-w-sm" placeholder={`Buscar ${String(title || "cadastro").toLowerCase()}`} disabled />
        <Button onClick={noop}>{addLabel}</Button>
      </section>

      <section className="app-panel mb-5 grid gap-4 p-5">
        <div>
          <h2 className="text-lg font-extrabold text-akrus-900">{formTitle}</h2>
          <p className="text-sm text-slate-500">{formDescription}</p>
        </div>
        <label className="grid gap-2">
          <span className="form-label">{searchLabel}</span>
          <input className="form-input" placeholder={searchPlaceholder} disabled />
        </label>
        <label className="grid gap-2">
          <span className="form-label">{nameLabel}</span>
          <input className="form-input" placeholder={namePlaceholder} disabled />
        </label>
        <div className="flex justify-end">
          <Button onClick={noop} disabled>Salvar</Button>
        </div>
      </section>

      <section className="app-panel px-4 py-6 text-center text-sm text-slate-500">
        Nenhum registro carregado. A regra sera reconstruida a partir das tabelas reais.
      </section>
    </div>
  );
}
