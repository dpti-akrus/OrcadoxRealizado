import AdminCrudPage from "../components/AdminCrudPage.jsx";
import {
  inativarContaAdmin,
  listarContasAdmin,
  salvarContaAdmin
} from "../services/adminCadastrosService.js";

export default function ContasContabeisPage() {
  return (
    <AdminCrudPage
      title="Contas contabeis"
      description="Cadastro real das contas contabeis usadas no orcamento."
      addLabel="Adicionar conta"
      loadItems={listarContasAdmin}
      saveItem={salvarContaAdmin}
      inactiveItem={inativarContaAdmin}
      searchKeys={["codigo", "nome"]}
      emptyText="Nenhuma conta contabil cadastrada."
      columns={[
        { key: "codigo", label: "CODCTACTB", strong: true },
        { key: "nome", label: "Descricao" },
        { key: "ativo", label: "Status" }
      ]}
      fields={[
        { name: "codigo", label: "CODCTACTB *", numeric: true, required: true },
        { name: "nome", label: "Descricao *", required: true }
      ]}
    />
  );
}
