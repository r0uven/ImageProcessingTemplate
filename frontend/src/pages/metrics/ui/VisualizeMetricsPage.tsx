import { useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getProcessingMetrics, type DistributionType } from "@/entities/analysis";
import { clearAllWorkspaceStates } from "@/entities/workspace";
import { readStoredDecimals, storeDecimals } from "@/shared/lib/decimals";
import { useAsyncData } from "@/shared/lib/useAsyncData";
import { Button } from "@/shared/ui/button";
import { Page, PageContent, PageHeader, PageTitleBlock } from "@/shared/ui/page";
import { SegmentedButton } from "@/shared/ui/segmented";
import { PageSubtitle, PageTitle } from "@/shared/ui/typography";
import {
  CHART_DECIMALS_STORAGE_KEY,
  DISTRIBUTION_META,
  DISTRIBUTION_ORDER,
  DistributionCard,
  getRoundingLabel,
  groupDistribution,
  StatisticsCard,
  type Section,
} from "@/widgets/metrics-distribution";
import { AnalysisImagesCard } from "@/widgets/metrics-images";
import { SettingsUsedCard } from "@/widgets/metrics-settings-used";
import { PoreMetricsCard } from "@/widgets/pore-metrics";

import * as S from "./MetricsPage.styles";

export const ProcessingMetricsPage = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>("characteristics");
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

  const {
    data: metrics,
    loading,
    error,
  } = useAsyncData(async () => {
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
      <Page>
        <PageContent $padding="72px">
          <PageTitle>Загрузка результатов...</PageTitle>
        </PageContent>
      </Page>
    );
  }

  if (error || !metrics || !runId) {
    return (
      <Page>
        <PageContent $padding="72px">
          <PageTitle>{error ?? "Результаты не найдены"}</PageTitle>

          <S.Actions>
            <Button $variant="primary" $size="lg" onClick={startNewProcessing}>
              Новая обработка
            </Button>
          </S.Actions>
        </PageContent>
      </Page>
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

  return (
    <Page>
      <PageContent $padding="72px">
        <PageHeader $marginBottom="40px">
          <PageTitleBlock>
            <PageTitle>Статистический анализ результатов сегментации</PageTitle>

            <PageSubtitle>Анализ характеристик обнаруженных объектов</PageSubtitle>
          </PageTitleBlock>

          <S.ImageInfoCard>
            <S.ImageInfoTitle>Обработанное изображение</S.ImageInfoTitle>

            <S.ImageInfoValue>{metrics.filename}</S.ImageInfoValue>

            <S.ImageInfoText>
              Обнаружено объектов: <strong>{metrics.detectedObjects}</strong>
            </S.ImageInfoText>
          </S.ImageInfoCard>
        </PageHeader>

        <S.SectionTabs $plain>
          <SegmentedButton
            $size="lg"
            $active={activeSection === "characteristics"}
            onClick={() => setActiveSection("characteristics")}
          >
            Характеристики
          </SegmentedButton>

          <SegmentedButton
            $size="lg"
            $active={activeSection === "overview"}
            onClick={() => setActiveSection("overview")}
          >
            Изображения и параметры
          </SegmentedButton>
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

            <DistributionCard
              availableDistributions={availableDistributions}
              activeDistribution={activeDistribution}
              activeMeta={activeMeta}
              activeUnit={activeUnit}
              chartData={chartData}
              chartDecimals={chartDecimals}
              roundingLabel={getRoundingLabel(chartDecimals)}
              onSelectDistribution={setSelectedDistribution}
              onDecimalsChange={changeChartDecimals}
            />

            {activeValuesCount > 0 && (
              <StatisticsCard
                meta={activeMeta}
                statistics={activeStatistics}
                valuesCount={activeValuesCount}
                unit={activeUnit}
              />
            )}
          </>
        )}

        <S.Actions>
          <Button $variant="secondary" $size="lg" onClick={goBackToWorkspace}>
            Изменить настройки
          </Button>

          <Button $variant="primary" $size="lg" onClick={startNewProcessing}>
            Новая обработка
          </Button>
        </S.Actions>
      </PageContent>
    </Page>
  );
};
