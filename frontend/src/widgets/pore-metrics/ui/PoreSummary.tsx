import type { MetricUnits, PoreSummary as PoreSummaryData } from "@/entities/analysis";

import { formatNumber } from "../lib/format";
import * as S from "./PoreMetricsSummary.styles";

type PoreSummaryProps = {
  summary: PoreSummaryData;
  units: MetricUnits;
};

export function PoreSummary({ summary, units }: PoreSummaryProps) {
  const summaryItems = [
    {
      label: "Количество найденных пор",
      value: formatNumber(summary.poreCount, 0),
      unit: "шт.",
    },
    {
      label: "Суммарная площадь пор",
      value: formatNumber(summary.totalPoreArea),
      unit: units.area,
    },
    {
      label: "Пористость",
      value: formatNumber(summary.porosityPercent, 2),
      unit: "%",
    },
    {
      label: "Средняя площадь поры",
      value: formatNumber(summary.meanPoreArea),
      unit: units.area,
    },
    {
      label: "Средний эквивалентный радиус",
      value: formatNumber(summary.meanEquivalentRadius),
      unit: units.length,
    },
    {
      label: "Минимальный эквивалентный радиус",
      value: formatNumber(summary.minEquivalentRadius),
      unit: units.length,
    },
    {
      label: "Максимальный эквивалентный радиус",
      value: formatNumber(summary.maxEquivalentRadius),
      unit: units.length,
    },
  ];

  return (
    <S.SummaryGrid>
      {summaryItems.map((item) => (
        <S.SummaryItem key={item.label}>
          <S.SummaryLabel>{item.label}</S.SummaryLabel>
          <S.SummaryValue>
            {item.value}
            <S.Unit>{item.unit}</S.Unit>
          </S.SummaryValue>
        </S.SummaryItem>
      ))}
    </S.SummaryGrid>
  );
}
