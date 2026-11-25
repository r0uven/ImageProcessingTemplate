import type { PoreTableRow } from "@/entities/analysis";

export type SortKey = "index" | "area" | "equivalentRadius" | "centerX" | "centerY";

export type SortState = {
  key: SortKey;
  direction: "asc" | "desc";
};

export const SORT_LABELS: Record<SortKey, string> = {
  index: "номеру",
  area: "площади",
  equivalentRadius: "радиусу",
  centerX: "координате X",
  centerY: "координате Y",
};

export function sortPores(
  pores: PoreTableRow[],
  sort: SortState,
): PoreTableRow[] {
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
}
