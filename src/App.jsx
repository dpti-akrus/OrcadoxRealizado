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
  const [currentPage, setCurrentPage] = useState("empresas");
  const Page = pages[currentPage];

  return (
    <main className="min-h-screen bg-[#f4f7fb] lg:grid lg:grid-cols-[220px_1fr]">
      <Sidebar currentPage={currentPage} onChangePage={setCurrentPage} />

      <section className="min-w-0 p-5 lg:p-7">
        <Page />
      </section>
    </main>
  );
}
