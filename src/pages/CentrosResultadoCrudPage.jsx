import AdminCrudPage from "../components/AdminCrudPage.jsx";
import {
  inativarCentroAdmin,
  listarCentrosAdmin,
  salvarCentroAdmin
} from "../services/adminCadastrosService.js";

export default function CentrosResultadoCrudPage() {
  return (
    <AdminCrudPage
      title="Centro de resultado"
      description="Cadastro real dos centros de resultado usados no orcamento."
      addLabel="Adicionar CR"
      loadItems={listarCentrosAdmin}
      saveItem={salvarCentroAdmin}
      inactiveItem={inativarCentroAdmin}
      searchKeys={["codigo", "nome"]}
      emptyText="Nenhum centro de resultado cadastrado."
      columns={[
        { key: "codigo", label: "CODCENCUS", strong: true },
        { key: "nome", label: "Descricao" },
        { key: "ativo", label: "Status" }
      ]}
      fields={[
        { name: "codigo", label: "CODCENCUS *", numeric: true, required: true },
        { name: "nome", label: "Descricao *", required: true }
      ]}
    />
  );
}
