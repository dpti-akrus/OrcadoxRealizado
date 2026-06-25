import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import EmpresasPage from "./pages/EmpresasPage.jsx";
import CentrosResultadoPage from "./pages/CentrosResultadoCrudPage.jsx";
import ContasContabeisPage from "./pages/ContasContabeisPage.jsx";
import HistoricoLancamentosPage from "./pages/HistoricoLancamentosPage.jsx";
import OrcamentoAnualPage from "./pages/OrcamentoAnualPage.jsx";
import UsuariosPage from "./pages/UsuariosCrudPage.jsx";
import { buscarPerfilUsuarioOrcamento, isAdminOrcamento } from "./services/perfilUsuarioService.js";
import { getUsuarioLogado } from "./utils/session.js";

const restrictedPages = new Set(["empresas", "centros", "contas", "usuarios", "historico"]);

const pages = {
  lancamento: OrcamentoAnualPage,
  empresas: EmpresasPage,
  centros: CentrosResultadoPage,
  contas: ContasContabeisPage,
  usuarios: UsuariosPage,
  historico: HistoricoLancamentosPage
};

function aguardarUsuarioLogado(tentativas = 30) {
  return new Promise((resolve) => {
    let tentativaAtual = 0;

    function verificar() {
      const usuario = getUsuarioLogado();

      if (usuario.codusu > 0 || tentativaAtual >= tentativas) {
        resolve(usuario);
        return;
      }

      tentativaAtual += 1;
      window.setTimeout(verificar, 100);
    }

    verificar();
  });
}

function isAdministrativeUser(user) {
  return isAdminOrcamento(user?.perfil);
}

function canAccessPage(page, user) {
  return !restrictedPages.has(page) || isAdministrativeUser(user);
}

function obterUsuarioAtual() {
  const usuario = getUsuarioLogado();

  return {
    id: usuario.codusu ? String(usuario.codusu) : "",
    name: usuario.nome || "",
    email: usuario.email || "",
    perfil: {
      codusu: usuario.codusu || 0,
      tipo: "G",
      descricao: "Gestor",
      admin: false
    }
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("lancamento");
  const [pageVersion, setPageVersion] = useState(0);
  const [currentUser, setCurrentUser] = useState(obterUsuarioAtual);
  const [perfilCarregado, setPerfilCarregado] = useState(false);
  const [perfilError, setPerfilError] = useState("");
  const safeCurrentPage = canAccessPage(currentPage, currentUser) ? currentPage : "lancamento";
  const Page = pages[safeCurrentPage];

  useEffect(() => {
    let active = true;

    async function carregarPerfil() {
      try {
        setPerfilCarregado(false);
        const usuario = await aguardarUsuarioLogado();

        if (!usuario.codusu) {
          throw new Error("Nao foi possivel identificar o usuario logado no Sankhya.");
        }

        const perfil = await buscarPerfilUsuarioOrcamento(usuario.codusu);

        if (!active) return;

        setCurrentUser({
          id: usuario.codusu ? String(usuario.codusu) : "",
          name: usuario.nome || "",
          email: usuario.email || "",
          perfil
        });
        setPerfilError("");
        setCurrentPage("lancamento");
      } catch (erro) {
        if (!active) return;
        setCurrentUser(obterUsuarioAtual());
        setPerfilError(erro?.message || "Nao foi possivel carregar o perfil do usuario.");
      } finally {
        if (active) setPerfilCarregado(true);
      }
    }

    carregarPerfil();

    return () => {
      active = false;
    };
  }, []);

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
        <div className="mb-4 text-right text-xs font-semibold text-slate-500">
          Usuario logado: {currentUser.id || "0"}{currentUser.name ? ` - ${currentUser.name}` : ""}
        </div>
        {perfilError && (
          <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {perfilError}
          </div>
        )}
        {!perfilCarregado ? (
          <div className="app-panel px-5 py-8 text-center text-sm text-slate-500">
            Carregando usuario e permissoes...
          </div>
        ) : (
          <Page
            key={`${safeCurrentPage}-${pageVersion}-${currentUser.id}-${currentUser.perfil?.tipo}`}
            currentUser={currentUser}
            permissions={{
              isAdmin: isAdministrativeUser(currentUser),
              perfilCarregado
            }}
          />
        )}
      </section>
    </main>
  );
}
