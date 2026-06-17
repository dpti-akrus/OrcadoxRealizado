import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import EmpresasPage from "./pages/EmpresasPage.jsx";
import CentrosResultadoPage from "./pages/CentrosResultadoPage.jsx";
import ContasContabeisPage from "./pages/ContasContabeisPage.jsx";
import LancamentoOrcamentarioPage from "./pages/LancamentoOrcamentarioPage.jsx";
import RealizadoPage from "./pages/RealizadoPage.jsx";
import UsuariosPage from "./pages/UsuariosPage.jsx";
import { initialUsers } from "./data/mockData.js";

const restrictedPages = new Set(["empresas", "centros", "contas", "usuarios"]);
const administrativeUserTypes = new Set(["Administrador", "Administrativo"]);

const pages = {
  lancamento: LancamentoOrcamentarioPage,
  realizado: RealizadoPage,
  empresas: EmpresasPage,
  centros: CentrosResultadoPage,
  contas: ContasContabeisPage,
  usuarios: UsuariosPage
};

function isAdministrativeUser(user) {
  return administrativeUserTypes.has(user?.type);
}

function canAccessPage(page, user) {
  return !restrictedPages.has(page) || isAdministrativeUser(user);
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("lancamento");
  const [pageVersion, setPageVersion] = useState(0);
  const [launchedBudgets, setLaunchedBudgets] = useState([]);
  const [realizedEntries, setRealizedEntries] = useState([]);
  const currentUser = initialUsers[0];
  const safeCurrentPage = canAccessPage(currentPage, currentUser) ? currentPage : "lancamento";
  const Page = pages[safeCurrentPage];

  function handleChangePage(page) {
    if (!canAccessPage(page, currentUser)) {
      return;
    }

    setCurrentPage(page);
    setPageVersion((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] lg:grid lg:grid-cols-[220px_1fr]">
      <Sidebar
        currentPage={safeCurrentPage}
        onChangePage={handleChangePage}
        canViewRestrictedPages={isAdministrativeUser(currentUser)}
      />

      <section className="min-w-0 p-5 lg:p-7">
        <Page
          key={`${safeCurrentPage}-${pageVersion}`}
          launchedBudgets={launchedBudgets}
          setLaunchedBudgets={setLaunchedBudgets}
          realizedEntries={realizedEntries}
          setRealizedEntries={setRealizedEntries}
        />
      </section>
    </main>
  );
}
