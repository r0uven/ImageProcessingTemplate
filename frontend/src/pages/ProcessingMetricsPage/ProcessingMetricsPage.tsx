import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as S from "./ProcessingMetricsPage.styled";
import { DistributionChart } from "@/components/DistributionChart/DistributionChart";

type DistributionType =
  | "PORE_SIZE"
  | "AREA"
  | "PERIMETER"
  | "CIRCULARITY"
  | "FORM_FACTOR";

interface DistributionPoint {
  x: number;

  y: number;
}

interface DistributionStatistics {
  min: number;

  max: number;

  mean: number;

  median: number;

  standardDeviation: number;
}

export const ProcessingMetricsPage = () => {
  const navigate = useNavigate();

  const [selectedDistribution, setSelectedDistribution] =
    useState<DistributionType>("PORE_SIZE");

  // TODO заменить запросом к backend
  const distributions: Record<DistributionType, DistributionPoint[]> = {
    PORE_SIZE: [
      { x: 5, y: 8 },
      { x: 10, y: 21 },
      { x: 15, y: 36 },
      { x: 20, y: 58 },
      { x: 25, y: 47 },
      { x: 30, y: 26 },
      { x: 35, y: 14 },
      { x: 40, y: 6 },
    ],

    AREA: [
      { x: 20, y: 12 },
      { x: 40, y: 24 },
      { x: 60, y: 41 },
      { x: 80, y: 35 },
      { x: 100, y: 20 },
      { x: 120, y: 9 },
    ],

    PERIMETER: [
      { x: 10, y: 5 },
      { x: 20, y: 15 },
      { x: 30, y: 28 },
      { x: 40, y: 39 },
      { x: 50, y: 33 },
      { x: 60, y: 17 },
    ],

    CIRCULARITY: [
      { x: 0.2, y: 4 },
      { x: 0.4, y: 16 },
      { x: 0.6, y: 32 },
      { x: 0.8, y: 44 },
      { x: 1.0, y: 21 },
    ],

    FORM_FACTOR: [
      { x: 0.3, y: 7 },
      { x: 0.5, y: 18 },
      { x: 0.7, y: 39 },
      { x: 0.9, y: 22 },
    ],
  };

  const statistics: Record<DistributionType, DistributionStatistics> = {
    PORE_SIZE: {
      min: 2,
      max: 46,
      mean: 18.4,
      median: 17.6,
      standardDeviation: 7.8,
    },

    AREA: {
      min: 15,
      max: 132,
      mean: 67.3,
      median: 64.9,
      standardDeviation: 18.2,
    },

    PERIMETER: {
      min: 11,
      max: 98,
      mean: 43.8,
      median: 41.3,
      standardDeviation: 14.5,
    },

    CIRCULARITY: {
      min: 0.19,
      max: 0.98,
      mean: 0.73,
      median: 0.76,
      standardDeviation: 0.11,
    },

    FORM_FACTOR: {
      min: 0.26,
      max: 0.96,
      mean: 0.71,
      median: 0.72,
      standardDeviation: 0.09,
    },
  };

  const titles = useMemo(
    () => ({
      PORE_SIZE: "Размер пор",
      AREA: "Площадь объектов",
      PERIMETER: "Периметр объектов",
      CIRCULARITY: "Круглость",
      FORM_FACTOR: "Фактор формы",
    }),
    [],
  );

  const currentStatistics = statistics[selectedDistribution];

  return (
    <S.Page>
      <S.Content>
        <S.Header>
          <S.TitleBlock>
            <S.Title>Статистический анализ результатов сегментации</S.Title>

            <S.Subtitle>Анализ характеристик обнаруженных объектов</S.Subtitle>
          </S.TitleBlock>

          <S.ImageInfoCard>
            <S.ImageInfoTitle>Обработанное изображение</S.ImageInfoTitle>

            <S.ImageInfoValue>road_001.png</S.ImageInfoValue>

            <S.ImageInfoText>
              Обнаружено объектов: <strong>432</strong>
            </S.ImageInfoText>
          </S.ImageInfoCard>
        </S.Header>

        <S.ChartCard>
          <S.CardTitle>Распределение характеристик</S.CardTitle>

          <S.ModeButtons>
            {Object.entries(titles).map(([key, value]) => (
              <S.ModeButton
                key={key}
                active={selectedDistribution === key}
                onClick={() => setSelectedDistribution(key as DistributionType)}
              >
                {value}
              </S.ModeButton>
            ))}
          </S.ModeButtons>

          <DistributionChart
            title={titles[selectedDistribution]}
            data={distributions[selectedDistribution]}
          />
        </S.ChartCard>

        <S.StatisticsCard>
          <S.CardTitle>Статистические характеристики</S.CardTitle>

          <S.StatisticsGrid>
            <S.Statistic>
              <S.Label>Минимальное значение</S.Label>
              <S.Value>{currentStatistics.min}</S.Value>
            </S.Statistic>

            <S.Statistic>
              <S.Label>Максимальное значение</S.Label>
              <S.Value>{currentStatistics.max}</S.Value>
            </S.Statistic>

            <S.Statistic>
              <S.Label>Среднее значение</S.Label>
              <S.Value>{currentStatistics.mean}</S.Value>
            </S.Statistic>

            <S.Statistic>
              <S.Label>Медиана</S.Label>
              <S.Value>{currentStatistics.median}</S.Value>
            </S.Statistic>

            <S.Statistic>
              <S.Label>Среднеквадратическое отклонение</S.Label>

              <S.Value>{currentStatistics.standardDeviation}</S.Value>
            </S.Statistic>
          </S.StatisticsGrid>
        </S.StatisticsCard>

        <S.Actions>
          <S.NewProcessingButton onClick={() => navigate("/workspace")}>
            Новая обработка
          </S.NewProcessingButton>
        </S.Actions>
      </S.Content>
    </S.Page>
  );
};
