import AdminCrudPage from "../components/AdminCrudPage.jsx";
import {
  inativarEmpresaAdmin,
  listarEmpresasAdmin,
  listarGruposEmpresa,
  salvarEmpresaAdmin
} from "../services/adminCadastrosService.js";

export default function EmpresasPage() {
  return (
    <AdminCrudPage
      title="Empresas"
      description="Cadastro real das empresas usadas no orcamento."
      addLabel="Adicionar empresa"
      loadItems={listarEmpresasAdmin}
      saveItem={salvarEmpresaAdmin}
      inactiveItem={inativarEmpresaAdmin}
      loadOptions={async () => {
        const grupos = await listarGruposEmpresa();
        return {
          grupos: grupos.map((grupo) => ({
            value: String(grupo.idOrcGruEmp),
            label: `${grupo.idOrcGruEmp} - ${grupo.grupoEmpresa}`
          }))
        };
      }}
      searchKeys={["codigo", "nome", "grupo"]}
      emptyText="Nenhuma empresa cadastrada."
      columns={[
        { key: "codigo", label: "CODEMP", strong: true },
        { key: "nome", label: "Empresa" },
        { key: "grupo", label: "Grupo" },
        { key: "ativo", label: "Status" }
      ]}
      fields={[
        { name: "codigo", label: "CODEMP *", numeric: true, required: true },
        { name: "nome", label: "Nome fantasia *", required: true },
        { name: "grupoId", label: "Grupo empresarial", type: "select", optionsKey: "grupos" }
      ]}
    />
  );
}
