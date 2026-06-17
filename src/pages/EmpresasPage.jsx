import EntityManager from "../components/EntityManager.jsx";
import { initialCompanies, systemCompanies } from "../data/mockData.js";

export default function EmpresasPage() {
  return (
    <EntityManager
      eyebrow="Cadastros"
      title="Empresas"
      description="Controle quais empresas aparecem na plataforma e como elas serão chamadas."
      addLabel="+ Adicionar empresa"
      formTitle="Adicionar empresa"
      formDescription="Busque a empresa do sistema e defina o nome usado dentro da plataforma."
      searchLabel="Buscar empresa no sistema"
      nameLabel="Nome na plataforma"
      searchPlaceholder="Ex: B&M, Dayantti, Bio Folium"
      namePlaceholder="Ex: B&M Insumos"
      initialItems={initialCompanies}
      suggestions={systemCompanies}
    />
  );
}
