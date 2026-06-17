const menuItems = [
  { id: "lancamento", label: "Lançar Orçamento", icon: "+" },
  { id: "empresas", label: "Empresas", icon: "#" },
  { id: "centros", label: "Centro de resultado", icon: "@" },
  { id: "contas", label: "Contas Contábeis", icon: "$" }
];

export default function Sidebar({ currentPage, onChangePage }) {
  return (
    <aside className="bg-akrus px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen">
      <div className="mb-8 flex items-center gap-3 text-[22px] font-extrabold tracking-[0.35em]">
        
        AKRUS
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {menuItems.map((item) => {
          const active = currentPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangePage(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                active ? "bg-white text-akrus" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="w-5 text-center font-bold">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
