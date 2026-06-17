import Button from "./Button.jsx";

export default function PageHeader({ eyebrow, title, description, actionLabel, onAction }) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-sm text-slate-500">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold leading-tight text-akrus-900 lg:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>

      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </header>
  );
}
