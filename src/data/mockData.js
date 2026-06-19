export const initialCompanyGroups = [
  { id: "bem", name: "BEM" },
  { id: "davantti", name: "DAVANTTI" },
  { id: "biofolium", name: "BIOFOLIUM" }
];

export const initialCompanies = [
  { id: 1, code: "1", name: "Bem", systemName: "Bem industrias de Sementes LTDA", groupId: "bem", active: true },
  { id: 2, code: "2", name: "Bem", systemName: "Bem industrias de Sementes - Filial 2", groupId: "bem", active: true },
  { id: 3, code: "3", name: "Bem", systemName: "Bem industrias de Sementes - Filial 3", groupId: "bem", active: true },
  { id: 61, code: "61", name: "Davantti", systemName: "Davantti Implementos LTDA", groupId: "davantti", active: true },
  { id: 51, code: "51", name: "Biofolium", systemName: "Biofolium Fertilizantes LTDA", groupId: "biofolium", active: true }
];

export const initialCostCenters = [
  { id: 101, code: "100101", name: "Administrativo", systemName: "100101 - Administrativo", active: true },
  { id: 102, code: "100211", name: "Comercial Revendas", systemName: "100211 - Comercial Revendas", active: true },
  { id: 103, code: "200315", name: "Operações e Logística", systemName: "200315 - Operações e Logística", active: true }
];

export const initialAccounts = [
  { id: 201, code: "3.01.01", name: "Salários", systemName: "3.01.01 - Salários e Ordenados", active: true },
  { id: 202, code: "3.02.04", name: "Manutenção", systemName: "3.02.04 - Manutenção Predial", active: true },
  { id: 203, code: "3.03.08", name: "Energia", systemName: "3.03.08 - Energia Elétrica", active: true }
];

export const initialUsers = [
  { id: 301, code: "282", systemUserName: "Carlos A", name: "Carlos André", role: "Gestor administrativo", type: "Administrador", active: true },
  { id: 302, code: "347", systemUserName: "Ana Paula", name: "Ana Paula", role: "Controladoria", type: "Normal", active: true },
  { id: 303, code: "419", systemUserName: "Marcos S", name: "Marcos Silva", role: "Operações", type: "Normal", active: true }
];

export const systemCompanies = [
  "Bem industrias de Sementes LTDA",
  "Davantti Implementos LTDA",
  "Biofolium Fertilizantes LTDA",
  "Akrus Matriz",
  "Akrus Filial Brasília"
];

export const systemCostCenters = [
  "100101 - Administrativo",
  "100211 - Comercial Revendas",
  "200315 - Operações e Logística",
  "300420 - Marketing e Eventos",
  "400101 - Tecnologia da Informação"
];

export const systemAccounts = [
  "3.01.01 - Salários e Ordenados",
  "3.01.02 - Encargos Sociais",
  "3.02.04 - Manutenção Predial",
  "3.03.08 - Energia Elétrica",
  "3.04.11 - Serviços de Terceiros"
];

export const systemUsers = [
  { code: "282", name: "Carlos A" },
  { code: "347", name: "Ana Paula" },
  { code: "419", name: "Marcos S" },
  { code: "501", name: "Juliana Costa" },
  { code: "612", name: "Roberto Lima" }
];

export const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export const initialErpRealizedEntries = [
  { id: 1, companyId: 1, costCenterId: 101, accountId: 201, monthlyValues: [9800, 9800, 10200, 10200, 10500, 10500, 10800, 10800, 11000, 11000, 11200, 11200] },
  { id: 2, companyId: 1, costCenterId: 101, accountId: 203, monthlyValues: [4200, 3980, 4050, 4320, 4490, 4610, 4780, 4720, 4890, 5010, 5150, 5230] },
  { id: 3, companyId: 1, costCenterId: 102, accountId: 202, monthlyValues: [6300, 2800, 4100, 7200, 3600, 5400, 8100, 3900, 4600, 6800, 5200, 7500] },
  { id: 4, companyId: 2, costCenterId: 101, accountId: 201, monthlyValues: [7600, 7600, 7800, 7800, 7950, 7950, 8100, 8100, 8250, 8250, 8400, 8400] },
  { id: 5, companyId: 2, costCenterId: 103, accountId: 203, monthlyValues: [3150, 3220, 3480, 3510, 3680, 3720, 3890, 4010, 3950, 4120, 4250, 4380] },
  { id: 6, companyId: 3, costCenterId: 102, accountId: 201, monthlyValues: [6800, 6800, 6950, 6950, 7100, 7100, 7250, 7250, 7400, 7400, 7550, 7550] },
  { id: 7, companyId: 61, costCenterId: 101, accountId: 202, monthlyValues: [5100, 3400, 4700, 3900, 6200, 4100, 5300, 4500, 6800, 4900, 5700, 7200] },
  { id: 8, companyId: 61, costCenterId: 103, accountId: 203, monthlyValues: [2800, 2910, 3040, 3180, 3270, 3390, 3450, 3580, 3660, 3790, 3870, 3990] },
  { id: 9, companyId: 51, costCenterId: 101, accountId: 201, monthlyValues: [8900, 8900, 9100, 9100, 9300, 9300, 9500, 9500, 9700, 9700, 9900, 9900] },
  { id: 10, companyId: 51, costCenterId: 102, accountId: 203, monthlyValues: [3600, 3720, 3810, 3950, 4020, 4160, 4290, 4380, 4470, 4590, 4680, 4820] }
];
