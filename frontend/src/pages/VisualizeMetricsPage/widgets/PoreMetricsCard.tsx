import { useMemo, useState } from "react";

import type { MetricUnits, PoreSummary, PoreTableRow } from "@/api/types";
import { savePoresCsv } from "@/api/metrics/exportPoresCsv";
import { DecimalsSelect } from "@/components/DecimalsSelect/DecimalsSelect";
import { readStoredDecimals, storeDecimals } from "@/utils/decimals";
import * as S from "./PoreMetricsCard.styled";

type PoreMetricsCardProps = {
  runId: string;
  summary: PoreSummary;
  pores: PoreTableRow[];
  units: MetricUnits;
};

type SortKey = "index" | "area" | "equivalentRadius" | "centerX" | "centerY";

type SortState = {
  key: SortKey;
  direction: "asc" | "desc";
};

const SORT_LABELS: Record<SortKey, string> = {
  index: "номеру",
  area: "площади",
  equivalentRadius: "радиусу",
  centerX: "координате X",
  centerY: "координате Y",
};

const DECIMALS_STORAGE_KEY = "pore-table-decimals";

function formatNumber(
  value: number | null,
  maximumFractionDigits = 3,
  minimumFractionDigits = 0,
): string {
  if (value === null || !Number.isFinite(value)) return "—";

  return value.toLocaleString("ru-RU", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

export function PoreMetricsCard({
  runId,
  summary,
  pores,
  units,
}: PoreMetricsCardProps) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number>(() =>
    readStoredDecimals(DECIMALS_STORAGE_KEY),
  );
  const [sort, setSort] = useState<SortState>({
    key: "area",
    direction: "asc",
  });

  const sortedPores = useMemo(() => {
    const direction = sort.direction === "asc" ? 1 : -1;

    return [...pores].sort((left, right) => {
      const leftValue = left[sort.key];
      const rightValue = right[sort.key];

      if (leftValue === null && rightValue === null) {
        return left.index - right.index;
      }
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;

      return (leftValue - rightValue) * direction || left.index - right.index;
    });
  }, [pores, sort]);

  const hasCoordinates = useMemo(
    () => pores.some((pore) => pore.centerX !== null || pore.centerY !== null),
    [pores],
  );

  const formatTableCell = (value: number | null) =>
    formatNumber(value, decimals, decimals);

  const toggleSort = (key: SortKey) => {
    setSort((previous) =>
      previous.key === key
        ? {
            key,
            direction: previous.direction === "asc" ? "desc" : "asc",
          }
        : { key, direction: "asc" },
    );
  };

  const changeDecimals = (value: number) => {
    setDecimals(value);
    storeDecimals(DECIMALS_STORAGE_KEY, value);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      await savePoresCsv(runId);
    } catch {
      setExportError("Не удалось сохранить CSV. Попробуйте ещё раз.");
    } finally {
      setExporting(false);
    }
  };

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

  const sortIndicator = (key: SortKey) => {
    if (sort.key !== key) return "↕";

    return sort.direction === "asc" ? "↑" : "↓";
  };

  const sortableHeader = (
    key: SortKey,
    label: string,
    ariaSort: "none" | "ascending" | "descending",
  ) => (
    <S.Th aria-sort={ariaSort}>
      <S.SortButton
        type="button"
        $active={sort.key === key}
        onClick={() => toggleSort(key)}
        title={`Сортировать по ${SORT_LABELS[key]}`}
      >
        {label}
        <S.SortArrow $active={sort.key === key}>
          {sortIndicator(key)}
        </S.SortArrow>
      </S.SortButton>
    </S.Th>
  );

  const ariaSort = (key: SortKey) => {
    if (sort.key !== key) return "none" as const;
    return sort.direction === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  };

  return (
    <S.Card>
      <S.TopRow>
        <S.TitleBlock>
          <S.Title>Базовые характеристики пор</S.Title>
          <S.Subtitle>
            Количество, площадь, пористость и эквивалентные радиусы
            обнаруженных пор
          </S.Subtitle>
        </S.TitleBlock>

        <S.ExportButton
          type="button"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Сохранение..." : "Сохранить в CSV"}
        </S.ExportButton>
      </S.TopRow>

      {exportError && <S.ExportError>{exportError}</S.ExportError>}

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

      <S.TableHeader>
        <S.TableHeaderText>
          <S.TableTitle>Таблица пор</S.TableTitle>
          <S.TableHint>
            Нажмите на заголовок столбца, чтобы изменить сортировку. Заголовок
            таблицы остаётся на месте при прокрутке.
            {pores.length > 0 &&
              !hasCoordinates &&
              " Координаты центров недоступны для этого запуска — они сохраняются только для новых обработок."}
          </S.TableHint>
        </S.TableHeaderText>

        <DecimalsSelect
          id="pores-decimals"
          value={decimals}
          onChange={changeDecimals}
        />
      </S.TableHeader>

      {pores.length > 0 ? (
        <S.TableShell>
          <S.TableWrapper>
            <S.Table>
              <thead>
                <tr>
                  {sortableHeader("index", "№", ariaSort("index"))}
                  {sortableHeader(
                    "area",
                    `Площадь, ${units.area}`,
                    ariaSort("area"),
                  )}
                  {sortableHeader(
                    "equivalentRadius",
                    `Эквивалентный радиус, ${units.length}`,
                    ariaSort("equivalentRadius"),
                  )}
                  {hasCoordinates && (
                    <>
                      {sortableHeader(
                        "centerX",
                        `X, ${units.coordinates}`,
                        ariaSort("centerX"),
                      )}
                      {sortableHeader(
                        "centerY",
                        `Y, ${units.coordinates}`,
                        ariaSort("centerY"),
                      )}
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {sortedPores.map((pore) => (
                  <tr key={`${pore.index}:${pore.objectId}`}>
                    <S.Td>{pore.index}</S.Td>
                    <S.Td>{formatTableCell(pore.area)}</S.Td>
                    <S.Td>{formatTableCell(pore.equivalentRadius)}</S.Td>
                    {hasCoordinates && (
                      <>
                        <S.Td>{formatTableCell(pore.centerX)}</S.Td>
                        <S.Td>{formatTableCell(pore.centerY)}</S.Td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </S.Table>
          </S.TableWrapper>

          <S.TableFooter>
            <span>Всего пор в таблице: {pores.length}</span>
            <span>
              Сортировка: {SORT_LABELS[sort.key]}{" "}
              {sort.direction === "asc" ? "↑" : "↓"}
            </span>
          </S.TableFooter>
        </S.TableShell>
      ) : (
        <S.EmptyNote>
          Для этого запуска таблица пор пуста. Возможно, объекты не были
          обнаружены или запуск выполнен до появления подробной статистики.
        </S.EmptyNote>
      )}
    </S.Card>
  );
}
