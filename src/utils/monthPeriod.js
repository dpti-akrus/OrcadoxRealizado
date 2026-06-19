import { months } from "../data/mockData.js";

export const fullYearPeriod = { startMonth: 0, endMonth: 11 };

export function getMonthIndexes(period) {
  return Array.from(
    { length: period.endMonth - period.startMonth + 1 },
    (_, index) => period.startMonth + index
  );
}

export function sumValuesInPeriod(values, period) {
  return getMonthIndexes(period).reduce((total, index) => total + (Number(values[index]) || 0), 0);
}

export function getPeriodLabel(period) {
  if (period.startMonth === 0 && period.endMonth === 11) {
    return "Ano completo";
  }

  if (period.startMonth === period.endMonth) {
    return months[period.startMonth];
  }

  return `${months[period.startMonth]} a ${months[period.endMonth]}`;
}
