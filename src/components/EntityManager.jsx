import { useMemo, useState } from "react";
import Button from "./Button.jsx";
import EntityCard from "./EntityCard.jsx";
import EntityForm from "./EntityForm.jsx";
import PageHeader from "./PageHeader.jsx";

const emptyForm = { systemName: "", name: "" };

export default function EntityManager({
  eyebrow,
  title,
  description,
  addLabel,
  formTitle,
  formDescription,
  searchLabel,
  nameLabel,
  searchPlaceholder,
  namePlaceholder,
  initialItems,
  suggestions
}) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      return [item.code, item.name, item.systemName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [items, search]);

  function openCreateForm() {
    setEditingItem(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(item) {
    setEditingItem(item);
    setForm({ systemName: item.systemName, name: item.name });
    setFormOpen(true);
  }

  function toggleStatus(id) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  }

  function saveItem() {
    if (!form.systemName.trim() || !form.name.trim()) return;

    if (editingItem) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? { ...item, systemName: form.systemName.trim(), name: form.name.trim() }
            : item
        )
      );
    } else {
      const code = form.systemName.includes(" - ") ? form.systemName.split(" - ")[0] : undefined;
      setItems((current) => [
        ...current,
        {
          id: Date.now(),
          code,
          systemName: form.systemName.trim(),
          name: form.name.trim(),
          active: true
        }
      ]);
    }

    setFormOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <section className="app-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="form-input sm:max-w-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Buscar ${title.toLowerCase()}`}
        />
        <Button onClick={openCreateForm}>
          {addLabel}
        </Button>
      </section>

      {formOpen && (
        <div className="mb-5">
          <EntityForm
            title={formTitle}
            description={formDescription}
            searchLabel={searchLabel}
            nameLabel={nameLabel}
            searchPlaceholder={searchPlaceholder}
            namePlaceholder={namePlaceholder}
            suggestions={suggestions}
            form={form}
            editingItem={editingItem}
            onChange={setForm}
            onClose={() => setFormOpen(false)}
            onSave={saveItem}
          />
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <EntityCard key={item.id} item={item} onEdit={openEditForm} onToggle={toggleStatus} />
        ))}
      </section>
    </div>
  );
}
