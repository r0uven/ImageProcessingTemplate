import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import * as S from "./VisualizeMetricsPage.styled";
import { DistributionChart } from "@/components/DistributionChart/DistributionChart";
import { DecimalsSelect } from "@/components/DecimalsSelect/DecimalsSelect";
import type {
  DistributionPoint,
  DistributionType,
  MetricUnits,
} from "@/api/types";
import { getProcessingMetrics } from "@/api/metrics/getMetrics";
import { useAsyncData } from "@/hooks/useAsyncData";
import { clearAllWorkspaceStates } from "@/pages/WorkspacePage/workspaceStore";
import { readStoredDecimals, storeDecimals } from "@/utils/decimals";
import { AnalysisImagesCard } from "./widgets/AnalysisImagesCard";
import { PoreMetricsCard } from "./widgets/PoreMetricsCard";
import { SettingsUsedCard } from "./widgets/SettingsUsedCard";

type Section = "characteristics" | "overview";

type DistributionMeta = {
  title: string;
  unitKey: keyof MetricUnits | null;
  description: string;
};

const DISTRIBUTION_ORDER: DistributionType[] = [
  "PORE_SIZE",
  "AREA",
  "PERIMETER",
  "CIRCULARITY",
  "FORM_FACTOR",
];

const DISTRIBUTION_META: Record<DistributionType, DistributionMeta> = {
  PORE_SIZE: {
    title: "Эквивалентный диаметр",
    unitKey: "length",
    description: "Диаметр круга, площадь которого равна площади поры",
  },
  AREA: {
    title: "Площадь поры",
    unitKey: "area",
    description: "Площадь обнаруженной поры",
  },
  PERIMETER: {
    title: "Периметр поры",
    unitKey: "length",
    description: "Длина границы обнаруженной поры",
  },
  CIRCULARITY: {
    title: "Круглость",
    unitKey: null,
    description: "Безразмерная характеристика формы поры",
  },
  FORM_FACTOR: {
    title: "Фактор формы",
    unitKey: null,
    description: "Безразмерная характеристика формы поры",
  },
};

const STATISTIC_ROWS = [
  { key: "min", label: "Минимальное значение" },
  { key: "max", label: "Максимальное значение" },
  { key: "mean", label: "Среднее значение" },
  { key: "median", label: "Медиана" },
  { key: "standardDeviation", label: "Стандартное отклонение" },
] as const;

const CHART_DECIMALS_STORAGE_KEY = "distribution-chart-decimals";

/**
 * Округляет значения по оси X и объединяет одинаковые значения в один
 * столбец, чтобы на графике была видна частота, а не по одной поре на бар.
 */
function groupDistribution(
  points: DistributionPoint[],
  decimals: number,
): DistributionPoint[] {
  const counts = new Map<number, number>();

  for (const point of points) {
    const x = Number(point.x.toFixed(decimals));
    counts.set(x, (counts.get(x) ?? 0) + point.y);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left - right)
    .map(([x, y]) => ({ x, y }));
}

function formatNumber(value: number, maximumFractionDigits = 3): string {
  if (!Number.isFinite(value)) return "—";

  return value.toLocaleString("ru-RU", {
    maximumFractionDigits,
  });
}

export const ProcessingMetricsPage = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<Section>("characteristics");

  const [selectedDistribution, setSelectedDistribution] =
    useState<DistributionType>("PORE_SIZE");

  const [chartDecimals, setChartDecimals] = useState<number>(() =>
    readStoredDecimals(CHART_DECIMALS_STORAGE_KEY),
  );

  const changeChartDecimals = (value: number) => {
    setChartDecimals(value);
    storeDecimals(CHART_DECIMALS_STORAGE_KEY, value);
  };

  const { runId } = useParams<{ runId: string }>();

  const { data: metrics, loading, error } = useAsyncData(async () => {
    if (!runId) {
      throw new Error("Не указан идентификатор обработки");
    }

    try {
      return await getProcessingMetrics(runId);
    } catch (cause) {
      throw new Error("Не удалось загрузить результаты анализа", { cause });
    }
  }, [runId]);

  // Возврат к настройкам предыдущей обработки: страница обработки сохраняет
  // своё состояние, поэтому изображение и параметры останутся на месте.
  const goBackToWorkspace = () => {
    const historyIndex = (
      window.history.state as { idx?: number } | null
    )?.idx;

    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const startNewProcessing = () => {
    clearAllWorkspaceStates();
    navigate("/");
  };

  if (loading) {
    return (
      <S.Page>
        <S.Content>
          <S.Title>Загрузка результатов...</S.Title>
        </S.Content>
      </S.Page>
    );
  }

  if (error || !metrics || !runId) {
    return (
      <S.Page>
        <S.Content>
          <S.Title>{error ?? "Результаты не найдены"}</S.Title>

          <S.Actions>
            <S.NewProcessingButton onClick={startNewProcessing}>
              Новая обработка
            </S.NewProcessingButton>
          </S.Actions>
        </S.Content>
      </S.Page>
    );
  }

  const availableDistributions = DISTRIBUTION_ORDER.filter(
    (type) => (metrics.distributions[type] ?? []).length > 0,
  );

  const activeDistribution = availableDistributions.includes(
    selectedDistribution,
  )
    ? selectedDistribution
    : (availableDistributions[0] ?? "PORE_SIZE");

  const activeMeta = DISTRIBUTION_META[activeDistribution];
  const activeStatistics = metrics.statistics[activeDistribution];
  const activeUnit = activeMeta.unitKey
    ? metrics.units[activeMeta.unitKey]
    : "";
  const activeValuesCount =
    metrics.distributions[activeDistribution]?.length ?? 0;
  const chartData = groupDistribution(
    metrics.distributions[activeDistribution] ?? [],
    chartDecimals,
  );
  const chartRoundingLabel =
    chartDecimals === 0
      ? "до целых"
      : `до ${chartDecimals} знаков после запятой`;

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

        <S.SectionTabs>
          <S.SectionTab
            type="button"
            $active={activeSection === "characteristics"}
            onClick={() => setActiveSection("characteristics")}
          >
            Характеристики
          </S.SectionTab>

          <S.SectionTab
            type="button"
            $active={activeSection === "overview"}
            onClick={() => setActiveSection("overview")}
          >
            Изображения и параметры
          </S.SectionTab>
        </S.SectionTabs>

        {activeSection === "overview" ? (
          <>
            <AnalysisImagesCard images={metrics.images} />

            <SettingsUsedCard data={metrics.settingsUsed} />
          </>
        ) : (
          <>
            <PoreMetricsCard
              runId={runId}
              summary={metrics.summary}
              pores={metrics.pores}
              units={metrics.units}
            />

            <S.ChartCard>
              <S.ChartHeader>
                <S.ChartHeaderText>
                  <S.CardHeader $compact>
                    <S.CardTitle>
                      Распределение: {activeMeta.title.toLowerCase()}
                    </S.CardTitle>
                    <S.CardSubtitle>
                      {activeMeta.description}. По оси Y — количество пор.
                      Значения по оси X округлены {chartRoundingLabel},
                      поэтому близкие значения объединяются в один столбец.
                    </S.CardSubtitle>
                  </S.CardHeader>
                </S.ChartHeaderText>

                <DecimalsSelect
                  id="chart-decimals"
                  value={chartDecimals}
                  onChange={changeChartDecimals}
                />
              </S.ChartHeader>

              {availableDistributions.length > 0 ? (
                <>
                  <S.ModeButtons>
                    {availableDistributions.map((distributionType) => (
                      <S.ModeButton
                        key={distributionType}
                        $active={activeDistribution === distributionType}
                        onClick={() =>
                          setSelectedDistribution(distributionType)
                        }
                      >
                        {DISTRIBUTION_META[distributionType].title}
                      </S.ModeButton>
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

            {activeValuesCount > 0 && (
              <S.StatisticsCard>
                <S.CardHeader>
                  <S.CardTitle>
                    Статистика: {activeMeta.title.toLowerCase()}
                  </S.CardTitle>
                  <S.CardSubtitle>
                    Рассчитано по {activeValuesCount} исходным значениям без
                    округления.
                  </S.CardSubtitle>
                </S.CardHeader>

                <S.StatisticsGrid>
                  {STATISTIC_ROWS.map((row) => (
                    <S.Statistic key={row.key}>
                      <S.Label>{row.label}</S.Label>
                      <S.Value>
                        {formatNumber(activeStatistics[row.key])}
                        {activeUnit && <S.ValueUnit>{activeUnit}</S.ValueUnit>}
                      </S.Value>
                    </S.Statistic>
                  ))}
                </S.StatisticsGrid>
              </S.StatisticsCard>
            )}
          </>
        )}

        <S.Actions>
          <S.ChangeSettingsButton onClick={goBackToWorkspace}>
            Изменить настройки
          </S.ChangeSettingsButton>

          <S.NewProcessingButton onClick={startNewProcessing}>
            Новая обработка
          </S.NewProcessingButton>
        </S.Actions>
      </S.Content>
    </S.Page>
  );
};
