import EntityManager from "../components/EntityManager.jsx";
import { initialCostCenters, systemCostCenters } from "../data/mockData.js";

export default function CentrosResultadoPage() {
  return (
    <EntityManager
      eyebrow="Cadastros"
      title="Centro de resultado"
      description="Cadastre os CRs liberados para orçamento e defina nomes mais amigáveis."
      addLabel="+ Adicionar CR"
      formTitle="Adicionar centro de resultado"
      formDescription="Futuramente a busca vem do sistema; por enquanto está mockada."
      searchLabel="Buscar CR no sistema"
      nameLabel="Nome na plataforma"
      searchPlaceholder="Ex: 100101 - Administrativo"
      namePlaceholder="Ex: Administrativo"
      initialItems={initialCostCenters}
      suggestions={systemCostCenters}
    />
  );
}
