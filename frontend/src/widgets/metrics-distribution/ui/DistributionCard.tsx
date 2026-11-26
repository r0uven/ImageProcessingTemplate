import type { DistributionPoint, DistributionType } from "@/entities/analysis";
import { DecimalsSelect } from "@/shared/ui/decimals-select";
import { DistributionChart } from "@/shared/ui/distribution-chart";
import { SegmentedButton } from "@/shared/ui/segmented";

import {
  DISTRIBUTION_META,
  type DistributionMeta,
} from "../model/distributionMeta";
import * as S from "./MetricsSections.styles";

type DistributionCardProps = {
  availableDistributions: DistributionType[];
  activeDistribution: DistributionType;
  activeMeta: DistributionMeta;
  activeUnit: string;
  chartData: DistributionPoint[];
  chartDecimals: number;
  roundingLabel: string;
  onSelectDistribution: (type: DistributionType) => void;
  onDecimalsChange: (value: number) => void;
};

/** Карточка распределения: переключатель характеристики и гистограмма. */
export function DistributionCard({
  availableDistributions,
  activeDistribution,
  activeMeta,
  activeUnit,
  chartData,
  chartDecimals,
  roundingLabel,
  onSelectDistribution,
  onDecimalsChange,
}: DistributionCardProps) {
  return (
    <S.ChartCard>
      <S.ChartHeader>
        <S.ChartHeaderText>
          <S.CardHeader $compact>
            <S.CardTitle>
              Распределение: {activeMeta.title.toLowerCase()}
            </S.CardTitle>
            <S.CardSubtitle>
              {activeMeta.description}. По оси Y — количество пор. Значения по
              оси X округлены {roundingLabel}, поэтому близкие значения
              объединяются в один столбец.
            </S.CardSubtitle>
          </S.CardHeader>
        </S.ChartHeaderText>

        <DecimalsSelect
          id="chart-decimals"
          value={chartDecimals}
          onChange={onDecimalsChange}
        />
      </S.ChartHeader>

      {availableDistributions.length > 0 ? (
        <>
          <S.ModeButtons>
            {availableDistributions.map((distributionType) => (
              <SegmentedButton
                key={distributionType}
                $active={activeDistribution === distributionType}
                onClick={() => onSelectDistribution(distributionType)}
              >
                {DISTRIBUTION_META[distributionType].title}
              </SegmentedButton>
            ))}
          </S.ModeButtons>

          <DistributionChart
            title={activeMeta.title}
            unit={activeUnit}
            data={chartData}
            decimals={chartDecimals}
          />
        </>
      ) : (
        <S.CardSubtitle>
          Для этого запуска нет данных о распределении характеристик.
        </S.CardSubtitle>
      )}
    </S.ChartCard>
  );
}
