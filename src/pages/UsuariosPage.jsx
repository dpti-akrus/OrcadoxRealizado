import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { initialCostCenters, initialUsers, systemUsers } from "../data/mockData.js";

const emptyUser = { code: "", systemUserName: "", name: "", role: "", type: "Normal", costCenterIds: [] };

export default function UsuariosPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [selectedCostCenterId, setSelectedCostCenterId] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) => [user.name, user.role].some((value) => value.toLowerCase().includes(term)));
  }, [users, search]);

  const linkedCostCenters = useMemo(
    () => initialCostCenters.filter((costCenter) => form.costCenterIds.includes(costCenter.id)),
    [form.costCenterIds]
  );

  const availableCostCenters = useMemo(
    () => initialCostCenters.filter((costCenter) => !form.costCenterIds.includes(costCenter.id)),
    [form.costCenterIds]
  );

  function openCreateForm() {
    setEditingUser(null);
    setForm(emptyUser);
    setSelectedCostCenterId("");
    setFormOpen(true);
  }

  function openEditForm(user) {
    setEditingUser(user);
    setForm({
      code: user.code,
      systemUserName: user.systemUserName,
      name: user.name,
      role: user.role || "",
      type: user.type || "Normal",
      costCenterIds: user.costCenterIds || []
    });
    setSelectedCostCenterId("");
    setFormOpen(true);
  }

  function handleSystemCodeChange(value) {
    const systemUser = systemUsers.find((user) => user.code === value.trim());

    setForm((current) => ({
      ...current,
      code: value,
      systemUserName: systemUser ? systemUser.name : ""
    }));
  }

  function closeForm() {
    setFormOpen(false);
    setEditingUser(null);
    setForm(emptyUser);
    setSelectedCostCenterId("");
  }

  function addCostCenterLink() {
    const nextCostCenterId = Number(selectedCostCenterId || availableCostCenters[0]?.id);

    if (!nextCostCenterId || form.costCenterIds.includes(nextCostCenterId)) {
      return;
    }

    setForm((current) => ({
      ...current,
      costCenterIds: [...current.costCenterIds, nextCostCenterId]
    }));
    setSelectedCostCenterId("");
  }

  function removeCostCenterLink(costCenterId) {
    setForm((current) => ({
      ...current,
      costCenterIds: current.costCenterIds.filter((linkedCostCenterId) => linkedCostCenterId !== costCenterId)
    }));
  }

  function saveUser() {
    if (!form.code.trim() || !form.systemUserName.trim() || !form.name.trim() || !form.role.trim()) {
      return;
    }

    if (editingUser) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                code: form.code.trim(),
                systemUserName: form.systemUserName.trim(),
                name: form.name.trim(),
                role: form.role.trim(),
                type: form.type,
                costCenterIds: form.costCenterIds
              }
            : user
        )
      );
    } else {
      setUsers((current) => [
        ...current,
        {
          id: Date.now(),
          code: form.code.trim(),
          systemUserName: form.systemUserName.trim(),
          name: form.name.trim(),
          role: form.role.trim(),
          type: form.type,
          costCenterIds: form.costCenterIds,
          active: true
        }
      ]);
    }

    closeForm();
  }

  if (formOpen) {
    return (
      <div>
        <PageHeader
          eyebrow="Cadastros"
          title={editingUser ? "Editar usuário" : "Adicionar usuário"}
          description="Confira os dados do ERP e defina nome e cargo exibidos no app."
        />

        <section className="app-panel grid gap-4 p-5">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <label className="grid gap-2">
              <span className="form-label">Código ERP</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.2} />
                <input
                  className="form-input pl-10"
                  value={form.code}
                  onChange={(event) => handleSystemCodeChange(event.target.value)}
                  placeholder="Ex: 282"
                  list="system-user-codes"
                  readOnly={Boolean(editingUser)}
                />
              </span>
              <datalist id="system-user-codes">
                {systemUsers.map((user) => (
                  <option value={user.code} key={user.code}>
                    {user.name}
                  </option>
                ))}
              </datalist>
            </label>

            <label className="grid gap-2">
              <span className="form-label">Nome ERP</span>
              <input className="form-input" value={form.systemUserName} readOnly placeholder="Selecione um código" />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2">
              <span className="form-label">Nome no app</span>
              <input
                className="form-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex: Carlos André"
              />
            </label>

            <label className="grid gap-2">
              <span className="form-label">Cargo</span>
              <input
                className="form-input"
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                placeholder="Ex: Gestor administrativo"
              />
            </label>

            <label className="grid gap-2">
              <span className="form-label">Tipo</span>
              <select
                className="form-input"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="Normal">Normal</option>
                <option value="Administrador">Administrador</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="form-label">Centros de resultado vinculados</span>
                <p className="mt-1 text-sm text-slate-500">Selecione os centros que este usuário poderá acessar.</p>
              </div>

              <div className="flex flex-col gap-2 sm:min-w-[360px] sm:flex-row">
                <select
                  className="form-input"
                  value={selectedCostCenterId}
                  onChange={(event) => setSelectedCostCenterId(event.target.value)}
                  disabled={availableCostCenters.length === 0}
                >
                  <option value="">
                    {availableCostCenters.length === 0 ? "Todos os centros vinculados" : "Selecionar centro"}
                  </option>
                  {availableCostCenters.map((costCenter) => (
                    <option value={costCenter.id} key={costCenter.id}>
                      {costCenter.code} - {costCenter.name}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={addCostCenterLink} disabled={availableCostCenters.length === 0}>
                  Vincular
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {linkedCostCenters.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-400">
                  Nenhum centro vinculado ainda.
                </div>
              ) : (
                linkedCostCenters.map((costCenter) => (
                  <div
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    key={costCenter.id}
                  >
                    <div>
                      <strong className="text-sm text-akrus-900">
                        {costCenter.code} - {costCenter.name}
                      </strong>
                      <p className="text-xs font-semibold text-slate-400">{costCenter.systemName}</p>
                    </div>
                    <button
                      className="inline-grid h-9 w-9 place-items-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
                      type="button"
                      onClick={() => removeCostCenterLink(costCenter.id)}
                      aria-label={`Remover centro ${costCenter.name}`}
                      title="Remover vínculo"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeForm}>
              Voltar
            </Button>
            <Button onClick={saveUser}>{editingUser ? "Salvar alterações" : "Adicionar usuário"}</Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Cadastros"
        title="Usuários"
        description="Gerencie nome e cargo dos usuários que usam a plataforma."
      />

      <section className="app-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="form-input sm:max-w-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou cargo"
        />
        <Button onClick={openCreateForm}>+ Adicionar usuário</Button>
      </section>

      <section className="app-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_80px] bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">
          <span>Nome</span>
          <span>Cargo</span>
          <span className="text-right">Editar</span>
        </div>

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_1fr_80px] items-center border-t border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50"
            onDoubleClick={() => openEditForm(user)}
            title="Clique duas vezes para editar"
          >
            <strong className="text-akrus-900">{user.name}</strong>
            <span className="text-slate-600">{user.role}</span>
            <span className="text-right">
              <button
                className="inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus transition hover:border-akrus/25 hover:bg-slate-50"
                type="button"
                onClick={() => openEditForm(user)}
                aria-label={`Editar usuário ${user.name}`}
                title="Editar usuário"
              >
                <Pencil className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
