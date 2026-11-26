import type { DistributionStatistics } from "@/entities/analysis";

import {
  formatNumber,
  STATISTIC_ROWS,
  type DistributionMeta,
} from "../model/distributionMeta";
import * as S from "./MetricsSections.styles";

type StatisticsCardProps = {
  meta: DistributionMeta;
  statistics: DistributionStatistics;
  valuesCount: number;
  unit: string;
};

/** Карточка со статистикой по выбранному распределению. */
export function StatisticsCard({
  meta,
  statistics,
  valuesCount,
  unit,
}: StatisticsCardProps) {
  return (
    <S.StatisticsCard>
      <S.CardHeader>
        <S.CardTitle>Статистика: {meta.title.toLowerCase()}</S.CardTitle>
        <S.CardSubtitle>
          Рассчитано по {valuesCount} исходным значениям без округления.
        </S.CardSubtitle>
      </S.CardHeader>

      <S.StatisticsGrid>
        {STATISTIC_ROWS.map((row) => (
          <S.Statistic key={row.key}>
            <S.Label>{row.label}</S.Label>
            <S.Value>
              {formatNumber(statistics[row.key])}
              {unit && <S.ValueUnit>{unit}</S.ValueUnit>}
            </S.Value>
          </S.Statistic>
        ))}
      </S.StatisticsGrid>
    </S.StatisticsCard>
  );
}
