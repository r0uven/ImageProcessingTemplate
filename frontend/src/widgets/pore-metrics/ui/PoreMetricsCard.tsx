import { useMemo, useState } from "react";

import type { MetricUnits, PoreSummary as PoreSummaryData, PoreTableRow } from "@/entities/analysis";
import { savePoresCsv } from "@/entities/analysis";
import { readStoredDecimals, storeDecimals } from "@/shared/lib/decimals";
import { DecimalsSelect } from "@/shared/ui/decimals-select";

import { sortPores, type SortKey, type SortState } from "../lib/sortPores";
import { PoreSummary } from "./PoreSummary";
import { PoreTable } from "./PoreTable";
import * as SummaryS from "./PoreMetricsSummary.styles";
import * as TableS from "./PoreMetricsTable.styles";

type PoreMetricsCardProps = {
  runId: string;
  summary: PoreSummaryData;
  pores: PoreTableRow[];
  units: MetricUnits;
};

const DECIMALS_STORAGE_KEY = "pore-table-decimals";

/** Карточка базовых характеристик пор: сводка, сортируемая таблица и CSV. */
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

  const sortedPores = useMemo(() => sortPores(pores, sort), [pores, sort]);

  const hasCoordinates = useMemo(
    () => pores.some((pore) => pore.centerX !== null || pore.centerY !== null),
    [pores],
  );

  const toggleSort = (key: SortKey) => {
    // Повторный клик по тому же столбцу меняет направление сортировки.
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

  return (
    <SummaryS.Card>
      <SummaryS.TopRow>
        <SummaryS.TitleBlock>
          <SummaryS.Title>Базовые характеристики пор</SummaryS.Title>
          <SummaryS.Subtitle>
            Количество, площадь, пористость и эквивалентные радиусы обнаруженных
            пор
          </SummaryS.Subtitle>
        </SummaryS.TitleBlock>

        <SummaryS.ExportButton
          type="button"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Сохранение..." : "Сохранить в CSV"}
        </SummaryS.ExportButton>
      </SummaryS.TopRow>

      {exportError && <SummaryS.ExportError>{exportError}</SummaryS.ExportError>}

      <PoreSummary summary={summary} units={units} />

      <TableS.TableHeader>
        <TableS.TableHeaderText>
          <TableS.TableTitle>Таблица пор</TableS.TableTitle>
          <TableS.TableHint>
            Нажмите на заголовок столбца, чтобы изменить сортировку. Заголовок
            таблицы остаётся на месте при прокрутке.
            {pores.length > 0 &&
              !hasCoordinates &&
              " Координаты центров недоступны для этого запуска — они сохраняются только для новых обработок."}
          </TableS.TableHint>
        </TableS.TableHeaderText>

        <DecimalsSelect
          id="pores-decimals"
          value={decimals}
          onChange={changeDecimals}
        />
      </TableS.TableHeader>

      {pores.length > 0 ? (
        <PoreTable
          pores={sortedPores}
          units={units}
          decimals={decimals}
          sort={sort}
          hasCoordinates={hasCoordinates}
          onToggleSort={toggleSort}
        />
      ) : (
        <TableS.EmptyNote>
          Для этого запуска таблица пор пуста. Возможно, объекты не были
          обнаружены или запуск выполнен до появления подробной статистики.
        </TableS.EmptyNote>
      )}
    </SummaryS.Card>
  );
}
