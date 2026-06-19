import { useMemo, useState } from "react";
import { Building2, Layers3, Link2, Pencil, Trash2 } from "lucide-react";
import Button from "../components/Button.jsx";
import EntityForm from "../components/EntityForm.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { initialCompanies, initialCompanyGroups, systemCompanies } from "../data/mockData.js";

const emptyCompanyForm = { systemName: "", name: "" };

export default function EmpresasPage() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [groups, setGroups] = useState(initialCompanyGroups);
  const [search, setSearch] = useState("");
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [groupName, setGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [linkingCompany, setLinkingCompany] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [activeForm, setActiveForm] = useState(null);

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return companies;
    }

    return companies.filter((company) => {
      const group = groups.find((item) => item.id === company.groupId);

      return [company.code, company.name, company.systemName, group?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [companies, groups, search]);

  const groupSummaries = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        companiesCount: companies.filter((company) => company.groupId === group.id).length
      })),
    [companies, groups]
  );

  function openCompanyForm(company = null) {
    setEditingCompany(company);
    setCompanyForm(company ? { systemName: company.systemName, name: company.name } : emptyCompanyForm);
    setLinkingCompany(null);
    setActiveForm("company");
  }

  function openGroupForm(group = null) {
    setGroupName(group?.name || "");
    setEditingGroup(group);
    setEditingCompany(null);
    setLinkingCompany(null);
    setActiveForm("group");
  }

  function openLinkForm(company) {
    setLinkingCompany(company);
    setSelectedGroupId(company.groupId || "");
    setEditingCompany(null);
    setActiveForm("link");
  }

  function closeForm() {
    setActiveForm(null);
    setEditingCompany(null);
    setLinkingCompany(null);
    setCompanyForm(emptyCompanyForm);
    setGroupName("");
    setEditingGroup(null);
    setSelectedGroupId("");
  }

  function saveCompany() {
    if (!companyForm.systemName.trim() || !companyForm.name.trim()) {
      return;
    }

    if (editingCompany) {
      setCompanies((current) =>
        current.map((company) =>
          company.id === editingCompany.id
            ? {
                ...company,
                systemName: companyForm.systemName.trim(),
                name: companyForm.name.trim()
              }
            : company
        )
      );
    } else {
      const code = companyForm.systemName.includes(" - ") ? companyForm.systemName.split(" - ")[0] : undefined;

      setCompanies((current) => [
        ...current,
        {
          id: Date.now(),
          code,
          systemName: companyForm.systemName.trim(),
          name: companyForm.name.trim(),
          groupId: null,
          active: true
        }
      ]);
    }

    closeForm();
  }

  function saveGroup() {
    const name = groupName.trim();

    if (
      !name ||
      groups.some((group) => group.id !== editingGroup?.id && group.name.toLowerCase() === name.toLowerCase())
    ) {
      return;
    }

    if (editingGroup) {
      setGroups((current) =>
        current.map((group) => (group.id === editingGroup.id ? { ...group, name } : group))
      );
      closeForm();
      return;
    }

    setGroups((current) => [
      ...current,
      {
        id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name
      }
    ]);
    closeForm();
  }

  function confirmDeleteGroup() {
    if (!groupToDelete || companies.some((company) => company.groupId === groupToDelete.id)) {
      return;
    }

    setGroups((current) => current.filter((group) => group.id !== groupToDelete.id));
    setGroupToDelete(null);
  }

  function saveGroupLink() {
    if (!linkingCompany || !selectedGroupId) {
      return;
    }

    setCompanies((current) =>
      current.map((company) => (company.id === linkingCompany.id ? { ...company, groupId: selectedGroupId } : company))
    );
    closeForm();
  }

  function toggleCompanyStatus(companyId) {
    setCompanies((current) =>
      current.map((company) => (company.id === companyId ? { ...company, active: !company.active } : company))
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Cadastros"
        title="Empresas"
        description="Cadastre empresas, organize os grupos empresariais e mantenha seus vínculos."
      />

      <section className="app-panel mb-5 flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          className="form-input lg:max-w-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar empresa, código ou grupo"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => openGroupForm()}>
            + Cadastrar grupo empresarial
          </Button>
          <Button onClick={() => openCompanyForm()}>+ Adicionar empresa</Button>
        </div>
      </section>

      {activeForm === "company" && (
        <div className="mb-5">
          <EntityForm
            title="Adicionar empresa"
            description="Busque a empresa do sistema e defina o nome usado dentro da plataforma."
            searchLabel="Buscar empresa no sistema"
            nameLabel="Nome na plataforma"
            searchPlaceholder="Ex: Bem indústrias de Sementes"
            namePlaceholder="Ex: Bem"
            suggestions={systemCompanies}
            form={companyForm}
            editingItem={editingCompany}
            onChange={setCompanyForm}
            onClose={closeForm}
            onSave={saveCompany}
          />
        </div>
      )}

      {activeForm === "group" && (
        <section className="app-panel mb-5 grid gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-akrus-900">
                {editingGroup ? "Editar grupo empresarial" : "Cadastrar grupo empresarial"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingGroup ? "Atualize o nome exibido para este grupo." : "Crie o nível que reúne uma ou mais empresas."}
              </p>
            </div>
            <Button variant="ghost" onClick={closeForm}>Fechar</Button>
          </div>

          <label className="grid gap-2 lg:max-w-xl">
            <span className="form-label">Nome do grupo</span>
            <input
              className="form-input"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Ex: BEM"
            />
          </label>

          <div className="flex justify-end">
            <Button onClick={saveGroup} disabled={!groupName.trim()}>
              {editingGroup ? "Salvar alterações" : "Cadastrar grupo"}
            </Button>
          </div>
        </section>
      )}

      {activeForm === "link" && linkingCompany && (
        <section className="app-panel mb-5 grid gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-akrus-900">Vincular grupo empresarial</h2>
              <p className="mt-1 text-sm text-slate-500">
                Defina o grupo da empresa {linkingCompany.code ? `${linkingCompany.code} - ` : ""}{linkingCompany.name}.
              </p>
            </div>
            <Button variant="ghost" onClick={closeForm}>Fechar</Button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <label className="grid flex-1 gap-2">
                <span className="form-label">Grupo empresarial</span>
                <select className="form-input" value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
                  <option value="">Selecionar grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </label>
              <Button onClick={saveGroupLink} disabled={!selectedGroupId}>Vincular</Button>
            </div>
          </div>
        </section>
      )}

      <section className="mb-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-akrus-900">Grupos empresariais</h2>
            <p className="text-sm text-slate-500">Agrupamentos disponíveis para vincular às empresas.</p>
          </div>
          <span className="text-sm font-bold text-akrus">{groups.length} grupo(s)</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groupSummaries.map((group) => (
            <article className="app-panel grid gap-4 p-4" key={group.id}>
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-akrus-50 text-akrus">
                  <Layers3 className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <div>
                  <strong className="block text-akrus-900">{group.name}</strong>
                  <span className="text-sm text-slate-500">{group.companiesCount} empresa(s) vinculada(s)</span>
                </div>
              </div>
              <div className="flex gap-2 border-t border-slate-200 pt-3">
                <Button variant="secondary" onClick={() => openGroupForm(group)}>
                  <span className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Editar</span>
                </Button>
                <Button variant="danger" onClick={() => setGroupToDelete(group)}>
                  <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> Excluir</span>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-akrus-900">Empresas cadastradas</h2>
            <p className="text-sm text-slate-500">Edite os dados e mantenha o vínculo com o grupo empresarial.</p>
          </div>
          <span className="text-sm font-bold text-akrus">{filteredCompanies.length} empresa(s)</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => {
            const group = groups.find((item) => item.id === company.groupId);

            return (
              <article
                className={`app-panel grid gap-4 p-5 transition hover:border-akrus/25 ${company.active ? "" : "opacity-55 grayscale"}`}
                key={company.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-akrus-50 text-akrus">
                    <Building2 className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${company.active ? "bg-akrus-50 text-akrus" : "bg-red-50 text-red-600"}`}>
                    {company.active ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div>
                  <strong className="block text-lg text-akrus-900">
                    {company.code ? `${company.code} - ` : ""}{company.name}
                  </strong>
                  <span className="block truncate text-sm text-slate-500">{company.systemName}</span>
                </div>

                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${group ? "border-akrus/15 bg-akrus-50 text-akrus" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                  <Link2 className="h-4 w-4 shrink-0" strokeWidth={2.2} />
                  <strong>{group ? `Grupo: ${group.name}` : "Sem grupo vinculado"}</strong>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                  <Button variant="secondary" onClick={() => openLinkForm(company)}>
                    {group ? "Alterar grupo" : "Vincular grupo"}
                  </Button>
                  <Button variant="secondary" onClick={() => openCompanyForm(company)}>Renomear</Button>
                  <Button variant={company.active ? "danger" : "secondary"} onClick={() => toggleCompanyStatus(company.id)}>
                    {company.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {groupToDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-[0_22px_55px_rgba(15,43,68,0.22)]">
            <h2 className="text-xl font-extrabold text-akrus-900">Excluir grupo empresarial?</h2>
            {companies.some((company) => company.groupId === groupToDelete.id) ? (
              <p className="mt-2 text-sm text-slate-500">
                O grupo <strong>{groupToDelete.name}</strong> possui empresas vinculadas. Altere o grupo dessas empresas antes de excluí-lo.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                O grupo <strong>{groupToDelete.name}</strong> será removido permanentemente.
              </p>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setGroupToDelete(null)}>Cancelar</Button>
              {!companies.some((company) => company.groupId === groupToDelete.id) && (
                <Button variant="danger" onClick={confirmDeleteGroup}>Excluir grupo</Button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
