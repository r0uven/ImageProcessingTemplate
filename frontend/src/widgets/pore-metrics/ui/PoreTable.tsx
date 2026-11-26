import type { MetricUnits, PoreTableRow } from "@/entities/analysis";

import { formatNumber } from "../lib/format";
import { SORT_LABELS, type SortKey, type SortState } from "../lib/sortPores";
import * as S from "./PoreMetricsTable.styles";

type PoreTableProps = {
  pores: PoreTableRow[];
  units: MetricUnits;
  decimals: number;
  sort: SortState;
  hasCoordinates: boolean;
  onToggleSort: (key: SortKey) => void;
};

/** Таблица пор с сортировкой по столбцам и настройкой точности. */
export function PoreTable({
  pores,
  units,
  decimals,
  sort,
  hasCoordinates,
  onToggleSort,
}: PoreTableProps) {
  const formatTableCell = (value: number | null) =>
    formatNumber(value, decimals, decimals);

  const sortIndicator = (key: SortKey) => {
    if (sort.key !== key) return "↕";

    return sort.direction === "asc" ? "↑" : "↓";
  };

  const ariaSort = (key: SortKey) => {
    if (sort.key !== key) return "none" as const;
    return sort.direction === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  };

  const sortableHeader = (key: SortKey, label: string) => (
    <S.Th aria-sort={ariaSort(key)}>
      <S.SortButton
        type="button"
        $active={sort.key === key}
        onClick={() => onToggleSort(key)}
        title={`Сортировать по ${SORT_LABELS[key]}`}
      >
        {label}
        <S.SortArrow $active={sort.key === key}>{sortIndicator(key)}</S.SortArrow>
      </S.SortButton>
    </S.Th>
  );

  return (
    <S.TableShell>
      <S.TableWrapper>
        <S.Table>
          <thead>
            <tr>
              {sortableHeader("index", "№")}
              {sortableHeader("area", `Площадь, ${units.area}`)}
              {sortableHeader(
                "equivalentRadius",
                `Эквивалентный радиус, ${units.length}`,
              )}
              {hasCoordinates && (
                <>
                  {sortableHeader("centerX", `X, ${units.coordinates}`)}
                  {sortableHeader("centerY", `Y, ${units.coordinates}`)}
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {pores.map((pore) => (
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
  );
}
