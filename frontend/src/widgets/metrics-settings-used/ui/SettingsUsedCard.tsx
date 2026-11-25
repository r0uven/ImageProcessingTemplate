import { useMemo, useState } from "react";

import type { SettingsUsed } from "@/entities/analysis";

import { buildGroups } from "../lib/buildGroups";
import { buildSummary } from "../lib/buildSummary";
import * as S from "./SettingsUsedCard.styled";

type SettingsUsedCardProps = {
  data: SettingsUsed | null;
};

export function SettingsUsedCard({ data }: SettingsUsedCardProps) {
  const [expanded, setExpanded] = useState(false);

  const groups = useMemo(() => (data ? buildGroups(data) : []), [data]);
  const summary = useMemo(() => (data ? buildSummary(data) : []), [data]);

  if (!data) {
    return (
      <S.Card>
        <S.TitleWrap>
          <S.Title>Параметры обработки</S.Title>
        </S.TitleWrap>

        <S.Note>Для этого запуска параметры не сохранялись.</S.Note>
      </S.Card>
    );
  }

  return (
    <S.Card>
      <S.TopRow>
        <S.TitleWrap>
          <S.Title>Параметры обработки</S.Title>
          <S.Badge>
            {data.complete ? "снимок на момент запуска" : "частичные данные"}
          </S.Badge>
        </S.TitleWrap>

        {groups.length > 0 && (
          <S.ToggleButton
            type="button"
            $expanded={expanded}
            aria-expanded={expanded}
            onClick={() => setExpanded((previous) => !previous)}
          >
            {expanded ? "Свернуть" : "Подробнее"}
            <S.Chevron $expanded={expanded}>▾</S.Chevron>
          </S.ToggleButton>
        )}
      </S.TopRow>

      {summary.length > 0 && (
        <S.Summary>
          {summary.map((row) => (
            <S.SummaryRow key={row.label}>
              <S.SummaryLabel>{row.label}</S.SummaryLabel>
              <S.SummaryValue>{row.value}</S.SummaryValue>
            </S.SummaryRow>
          ))}
        </S.Summary>
      )}

      {expanded && groups.length > 0 && (
        <S.Groups>
          {groups.map((group) => (
            <S.Group key={group.key}>
              <S.GroupTitle>{group.title}</S.GroupTitle>

              <S.GroupRows>
                {group.rows.map((row, index) => (
                  <S.Row
                    key={`${group.key}:${row.label}:${index}`}
                    $stacked={row.stacked}
                  >
                    <S.RowLabel>{row.label}</S.RowLabel>
                    <S.RowValue $stacked={row.stacked}>{row.value}</S.RowValue>
                  </S.Row>
                ))}
              </S.GroupRows>
            </S.Group>
          ))}
        </S.Groups>
      )}

      {!data.complete && (
        <S.Note>
          Глобальные настройки (изображение, постобработка, обнаружение и
          характеристики) для этого запуска не сохранялись — показаны только
          параметры обработки.
        </S.Note>
      )}
    </S.Card>
  );
}
