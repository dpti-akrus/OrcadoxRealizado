import { useEffect, useMemo, useState } from "react";
import { Pencil, Search } from "lucide-react";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { buscarUsuarioSistemaPorCodigo, buscarUsuarios, salvarUsuario } from "../services/usuarioService.js";

const emptyUser = { code: "", systemUserName: "", name: "", role: "", type: "Normal" };
const typeFromDatabase = { A: "Administrador", N: "Normal", D: "Administrativo" };
const typeToDatabase = { Administrador: "A", Normal: "N", Administrativo: "D" };

function mapUser(user) {
  return {
    id: user.IDORCUSU,
    code: String(user.CODUSU ?? ""),
    systemUserName: "",
    name: user.NOMEAPP || "",
    role: user.CARGO || "",
    type: typeFromDatabase[user.TIPOUSU] || "Normal",
    active: user.ATIVO === "S"
  };
}

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSystemUser, setLoadingSystemUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        const result = await buscarUsuarios();
        if (active) setUsers(result.dados.map(mapUser));
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => { active = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return users;
    return users.filter((user) =>
      [user.code, user.name, user.role].some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term))
    );
  }, [users, search]);

  function openCreateForm() {
    setEditingUser(null);
    setForm(emptyUser);
    setMessage("");
    setFormOpen(true);
  }

  function openEditForm(user) {
    setEditingUser(user);
    setForm({
      code: user.code,
      systemUserName: user.systemUserName,
      name: user.name,
      role: user.role,
      type: user.type
    });
    setMessage("");
    setFormOpen(true);
  }

  function handleSystemCodeChange(value) {
    if (!/^\d*$/.test(value)) return;
    setForm((current) => ({ ...current, code: value, systemUserName: "" }));
    setMessage("");
  }

  async function searchSystemUser() {
    if (!form.code.trim()) {
      setMessage("Informe o código ERP do usuário.");
      return;
    }

    try {
      setLoadingSystemUser(true);
      setMessage("");
      const user = await buscarUsuarioSistemaPorCodigo(form.code);

      if (!user) {
        setForm((current) => ({ ...current, systemUserName: "" }));
        setMessage("Usuário não encontrado na TSIUSU.");
        return;
      }

      setForm((current) => ({
        ...current,
        code: String(user.codigo),
        systemUserName: user.nome,
        name: current.name || user.nome
      }));
    } catch (error) {
      console.error("Erro ao buscar usuário no Sankhya:", error);
      setMessage(error.message);
    } finally {
      setLoadingSystemUser(false);
    }
  }

  function closeForm() {
    setFormOpen(false);
    setEditingUser(null);
    setForm(emptyUser);
    setMessage("");
  }

  async function saveUser() {
    if (!editingUser && !form.systemUserName) {
      setMessage("Busque e valide o usuário na TSIUSU antes de finalizar o cadastro.");
      return;
    }
    if (!form.name.trim()) {
      setMessage("Informe o nome que será exibido no aplicativo.");
      return;
    }

    try {
      setSavingUser(true);
      setMessage("");
      await salvarUsuario({
        CODUSU: Number(form.code),
        IDORCUSU: editingUser?.id,
        NOMEAPP: form.name,
        CARGO: form.role,
        TIPOUSU: typeToDatabase[form.type],
        ATIVO: editingUser?.active === false ? "N" : "S"
      });
      const result = await buscarUsuarios();
      setUsers(result.dados.map(mapUser));
      closeForm();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      setMessage(error.message);
    } finally {
      setSavingUser(false);
    }
  }

  if (formOpen) {
    return (
      <div>
        <PageHeader
          eyebrow="Cadastros"
          title={editingUser ? "Editar usuário" : "Adicionar usuário"}
          description="Consulte o usuário do ERP pelo código e confira o nome retornado pela TSIUSU."
        />

        <section className="app-panel grid gap-4 p-5">
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <label className="grid gap-2">
              <span className="form-label">Código ERP</span>
              <span className="relative">
                <button
                  className="absolute left-2 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-akrus disabled:opacity-50"
                  type="button"
                  onClick={searchSystemUser}
                  disabled={loadingSystemUser || Boolean(editingUser)}
                  aria-label="Buscar usuário no Sankhya"
                  title="Buscar usuário no Sankhya"
                >
                  <Search className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <input
                  className="form-input pl-11"
                  value={form.code}
                  onChange={(event) => handleSystemCodeChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchSystemUser();
                    }
                  }}
                  placeholder="Ex: 282"
                  inputMode="numeric"
                  type="number"
                  min="0"
                  step="1"
                  readOnly={Boolean(editingUser)}
                />
              </span>
            </label>

            <label className="grid gap-2">
              <span className="form-label">Nome ERP</span>
              <input
                className="form-input"
                value={loadingSystemUser ? "Buscando usuário..." : form.systemUserName}
                readOnly
                placeholder="Clique na lupa ou pressione Enter"
              />
            </label>
          </div>

          {message && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p>}

          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2">
              <span className="form-label">Nome no app</span>
              <input className="form-input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="grid gap-2">
              <span className="form-label">Cargo</span>
              <input className="form-input" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
            </label>
            <label className="grid gap-2">
              <span className="form-label">Tipo</span>
              <select className="form-input" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="Administrador">Administrador</option>
                <option value="Normal">Normal</option>
                <option value="Administrativo">Administrativo</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeForm} disabled={savingUser}>Voltar</Button>
            <Button onClick={saveUser} disabled={savingUser || loadingSystemUser}>
              {savingUser ? "Salvando..." : editingUser ? "Salvar alterações" : "Finalizar cadastro"}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Cadastros" title="Usuários" description="Gerencie os usuários que possuem acesso à plataforma." />
      <section className="app-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input className="form-input sm:max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por código, nome ou cargo" />
        <Button onClick={openCreateForm}>+ Adicionar usuário</Button>
      </section>

      {message && !formOpen && <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{message}</p>}

      <section className="app-panel overflow-hidden">
        <div className="grid grid-cols-[100px_1fr_1fr_80px] bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">
          <span>Código</span><span>Nome</span><span>Cargo</span><span className="text-right">Editar</span>
        </div>

        {loadingUsers && <p className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">Carregando usuários...</p>}
        {!loadingUsers && filteredUsers.length === 0 && <p className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">Nenhum usuário cadastrado.</p>}
        {!loadingUsers && filteredUsers.map((user) => (
          <div key={user.id} className="grid grid-cols-[100px_1fr_1fr_80px] items-center border-t border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50">
            <span className="font-bold text-slate-500">{user.code}</span>
            <strong className="text-akrus-900">{user.name}</strong>
            <span className="text-slate-600">{user.role}</span>
            <span className="text-right">
              <button className="inline-grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-akrus" type="button" onClick={() => openEditForm(user)} aria-label={`Editar usuário ${user.name}`}>
                <Pencil className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
