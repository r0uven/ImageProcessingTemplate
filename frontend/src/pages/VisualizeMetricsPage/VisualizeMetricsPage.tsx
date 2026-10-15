import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as S from "./VisualizeMetricsPage.styled";
import { DistributionChart } from "@/components/DistributionChart/DistributionChart";
import type { DistributionType, ProcessingMetrics } from "./types";
import { getProcessingMetrics } from "@/api/metrics/getMetrics";

export const ProcessingMetricsPage = () => {
  const navigate = useNavigate();

  const [selectedDistribution, setSelectedDistribution] =
    useState<DistributionType>("PORE_SIZE");

  const { runId } = useParams<{ runId: string }>();
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) {
      setError("Не указан идентификатор обработки");
      setLoading(false);
      return;
    }

    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProcessingMetrics(runId);

        setMetrics(data);
      } catch {
        setError("Не удалось загрузить результаты анализа");
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [runId]);

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

  if (loading) {
    return (
      <S.Page>
        <S.Content>
          <S.Title>Загрузка результатов...</S.Title>
        </S.Content>
      </S.Page>
    );
  }

  if (error || !metrics) {
    return (
      <S.Page>
        <S.Content>
          <S.Title>{error ?? "Результаты не найдены"}</S.Title>

          <S.Actions>
            <S.NewProcessingButton onClick={() => navigate("/")}>
              Новая обработка
            </S.NewProcessingButton>
          </S.Actions>
        </S.Content>
      </S.Page>
    );
  }

  const currentStatistics = metrics.statistics[selectedDistribution];

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

            <S.ImageInfoValue>{metrics.filename}</S.ImageInfoValue>

            <S.ImageInfoText>
              Обнаружено объектов: <strong>{metrics.detectedObjects}</strong>
            </S.ImageInfoText>
          </S.ImageInfoCard>
        </S.Header>

        <S.ChartCard>
          <S.CardTitle>Распределение характеристик</S.CardTitle>

          <S.ModeButtons>
            {Object.entries(titles).map(([key, value]) => {
              const distributionType = key as DistributionType;

              return (
                <S.ModeButton
                  key={distributionType}
                  active={selectedDistribution === distributionType}
                  onClick={() => setSelectedDistribution(distributionType)}
                >
                  {value}
                </S.ModeButton>
              );
            })}
          </S.ModeButtons>

          <DistributionChart
            title={titles[selectedDistribution]}
            data={metrics.distributions[selectedDistribution]}
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
          <S.NewProcessingButton onClick={() => navigate("/")}>
            Новая обработка
          </S.NewProcessingButton>
        </S.Actions>
      </S.Content>
    </S.Page>
  );
};
