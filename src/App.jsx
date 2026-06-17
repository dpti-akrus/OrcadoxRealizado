import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import EmpresasPage from "./pages/EmpresasPage.jsx";
import CentrosResultadoPage from "./pages/CentrosResultadoPage.jsx";
import ContasContabeisPage from "./pages/ContasContabeisPage.jsx";
import LancamentoOrcamentarioPage from "./pages/LancamentoOrcamentarioPage.jsx";

const pages = {
  lancamento: LancamentoOrcamentarioPage,
  empresas: EmpresasPage,
  centros: CentrosResultadoPage,
  contas: ContasContabeisPage
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("lancamento");
  const [pageVersion, setPageVersion] = useState(0);
  const Page = pages[currentPage];

  function handleChangePage(page) {
    setCurrentPage(page);
    setPageVersion((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] lg:grid lg:grid-cols-[220px_1fr]">
      <Sidebar currentPage={currentPage} onChangePage={handleChangePage} />

      <section className="min-w-0 p-5 lg:p-7">
        <Page key={`${currentPage}-${pageVersion}`} />
      </section>
    </main>
  );
}
