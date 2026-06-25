import { Building2, Calculator, History, Landmark, Network, Users } from "lucide-react";

const menuItems = [
  { id: "lancamento", label: "Orçamento", icon: Calculator },
  { id: "empresas", label: "Empresas", icon: Building2, restricted: true },
  { id: "centros", label: "Centro de resultado", icon: Network, restricted: true },
  { id: "contas", label: "Contas Contábeis", icon: Landmark, restricted: true },
  { id: "usuarios", label: "Usuários", icon: Users, restricted: true },
  { id: "historico", label: "Historico de Lancamentos", icon: History, restricted: true }
];

export default function Sidebar({ currentPage, onChangePage, canViewRestrictedPages = false }) {
  const visibleMenuItems = menuItems.filter((item) => !item.restricted || canViewRestrictedPages);
  const baseFolder = document.getElementById("root")?.dataset.baseFolder ?? "";
  const logoUrl = `${baseFolder.replace(/\/$/, "")}/images/logo_akrus_branco.png`;

  return (
    <aside className="bg-akrus px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen">
      <div className="mb-8 flex items-center">
        <img className="h-7 w-auto" src={logoUrl} alt="Akrus" />
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {visibleMenuItems.map((item) => {
          const active = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangePage(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                active ? "!bg-white text-akrus" : "!bg-transparent text-white/80 hover:!bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.2} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
