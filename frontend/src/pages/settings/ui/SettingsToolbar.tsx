import type { RefObject } from "react";

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
            aria-label="Очистить поиск"
            onClick={() => onQueryChange("")}
          >
            ×
          </S.ClearSearch>
        )}
      </S.SearchBox>

      <S.ToolbarActions>
        <S.ToolbarButton type="button" onClick={onExpandAll}>
          Развернуть всё
        </S.ToolbarButton>

        <S.ToolbarButton type="button" onClick={onCollapseAll}>
          Свернуть всё
        </S.ToolbarButton>
      </S.ToolbarActions>
    </S.Toolbar>
  );
}
