export const months = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export const fullYearPeriod = { startMonth: 0, endMonth: 11 };

export function getPeriodLabel(period = fullYearPeriod) {
  if (period.startMonth === 0 && period.endMonth === 11) {
    return "Ano completo";
  }

  if (period.startMonth === period.endMonth) {
    return months[period.startMonth] || "Periodo";
  }

  return `${months[period.startMonth] || "Inicio"} a ${months[period.endMonth] || "Fim"}`;
}
