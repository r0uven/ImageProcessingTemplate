import type { RefObject } from "react";

import { Button } from "@/shared/ui/button";

import * as S from "./SettingsToolbar.styles";

type SettingsToolbarProps = {
  toolbarRef: RefObject<HTMLDivElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export function SettingsToolbar({
  toolbarRef,
  query,
  onQueryChange,
  onExpandAll,
  onCollapseAll,
}: SettingsToolbarProps) {
  return (
    <S.Toolbar ref={toolbarRef}>
      <S.SearchBox>
        <S.SearchInput
          type="search"
          value={query}
          placeholder="Поиск по разделам, названиям, путям и значениям"
          aria-label="Поиск по настройкам"
          onChange={(event) => onQueryChange(event.target.value)}
        />

        {query && (
          <S.ClearSearch
            type="button"
            $variant="ghost"
            $size={26}
            aria-label="Очистить поиск"
            onClick={() => onQueryChange("")}
          >
            ×
          </S.ClearSearch>
        )}
      </S.SearchBox>

      <S.ToolbarActions>
        <Button $variant="secondary" $size="sm" onClick={onExpandAll}>
          Развернуть всё
        </Button>

        <Button $variant="secondary" $size="sm" onClick={onCollapseAll}>
          Свернуть всё
        </Button>
      </S.ToolbarActions>
    </S.Toolbar>
  );
}
