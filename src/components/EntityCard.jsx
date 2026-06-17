import Button from "./Button.jsx";

export default function EntityCard({ item, onEdit, onToggle }) {
  const label = item.code ? `${item.code} - ${item.name}` : item.name;

  return (
    <article className={`relative grid min-h-44 place-items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:border-akrus/40 hover:shadow-panel ${item.active ? "" : "opacity-55 grayscale"}`}>
      <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-extrabold ${item.active ? "bg-akrus-50 text-akrus" : "bg-red-50 text-red-600"}`}>
        {item.active ? "Ativo" : "Inativo"}
      </span>

      <div className="grid min-h-12 min-w-32 place-items-center rounded-lg bg-akrus-50 px-4 text-lg font-black tracking-wide text-akrus">
        {label}
      </div>

      <small className="max-w-full truncate text-slate-500">{item.systemName}</small>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={() => onEdit(item)}>
          Renomear
        </Button>
        <Button variant={item.active ? "danger" : "secondary"} onClick={() => onToggle(item.id)}>
          {item.active ? "Desativar" : "Ativar"}
        </Button>
      </div>
    </article>
  );
}
