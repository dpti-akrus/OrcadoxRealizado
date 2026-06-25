import AdminCrudPage from "../components/AdminCrudPage.jsx";
import {
  inativarUsuarioAdmin,
  listarCentrosAdmin,
  listarUsuariosAdmin,
  listarVinculosUsuario,
  salvarUsuarioAdmin
} from "../services/adminCadastrosService.js";

export default function UsuariosCrudPage() {
  return (
    <AdminCrudPage
      title="Usuarios"
      description="Cadastro real dos usuarios do modulo e seus centros permitidos."
      addLabel="Adicionar usuario"
      loadItems={listarUsuariosAdmin}
      saveItem={salvarUsuarioAdmin}
      inactiveItem={inativarUsuarioAdmin}
      loadOptions={async () => {
        const centros = await listarCentrosAdmin();
        return {
          centros: centros.map((centro) => ({
            value: centro.id,
            label: `${centro.codigo} - ${centro.nome}`
          })),
          perfis: [
            { value: "G", label: "Gestor" },
            { value: "D", label: "Diretoria" },
            { value: "A", label: "Administrador" }
          ]
        };
      }}
      loadExtraForEdit={async (item) => {
        const vinculos = await listarVinculosUsuario(item.id);
        return { centros: vinculos.map((vinculo) => vinculo.idOrcCus) };
      }}
      searchKeys={["codigo", "nome", "cargo", "centroResultado", "tipoDesc"]}
      emptyText="Nenhum usuario cadastrado."
      columns={[
        { key: "codigo", label: "CODUSU", strong: true },
        { key: "nome", label: "Nome APP" },
        { key: "cargo", label: "Cargo" },
        { key: "centroResultado", label: "Centro" },
        { key: "tipoDesc", label: "Perfil" },
        { key: "ativo", label: "Status" }
      ]}
      fields={[
        { name: "codigo", label: "CODUSU *", numeric: true, required: true, readOnlyOnEdit: true },
        { name: "nome", label: "Nome no aplicativo *", required: true },
        { name: "cargo", label: "Cargo" },
        { name: "idOrcCus", label: "Centro de resultado principal *", type: "select", optionsKey: "centros", required: true },
        { name: "tipoUsu", label: "Perfil *", type: "select", optionsKey: "perfis", required: true },
        { name: "centros", label: "Centros de resultado adicionais", type: "multiselect", optionsKey: "centros" }
      ]}
    />
  );
}
