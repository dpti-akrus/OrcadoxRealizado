import EntityManager from "../components/EntityManager.jsx";
import { initialAccounts, systemAccounts } from "../data/mockData.js";

export default function ContasContabeisPage() {
  return (
    <EntityManager
      eyebrow="Cadastros"
      title="Contas contábeis"
      description="Defina quais contas podem receber lançamento orçamentário."
      addLabel="+ Adicionar conta"
      formTitle="Adicionar conta contábil"
      formDescription="Busque a conta do sistema e defina o nome curto exibido na plataforma."
      searchLabel="Buscar conta no sistema"
      nameLabel="Nome na plataforma"
      searchPlaceholder="Ex: 3.03.08 - Energia Elétrica"
      namePlaceholder="Ex: Energia"
      initialItems={initialAccounts}
      suggestions={systemAccounts}
    />
  );
}
