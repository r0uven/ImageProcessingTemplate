import { useState } from "react";
import { useNavigate } from "react-router-dom";

import * as S from "./HistoryPage.styled.tsx";
import { compareAsc, compareDesc, parse } from "date-fns";
import { getHistory } from "@/api/history/getHistory";
import type { HistoryItemResponse } from "@/api/history/getHistory";
import { deleteHistoryItem } from "@/api/history/deleteHistoryItem";
import { buildMediaUrl } from "@/api/client";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { useAsyncData } from "@/hooks/useAsyncData";
import TrashSVG from "@/assets/TrashSVG.svg?react";

export const HistoryPage = () => {
  const navigate = useNavigate();

  const { data: history, setData: setHistory, loading, error } =
    useAsyncData<HistoryItemResponse[]>(getHistory);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date-desc" | "date-asc" | "name" | "duration">("date-desc");

  const [filter, setFilter] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL");

  const [pendingDelete, setPendingDelete] =
    useState<HistoryItemResponse | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const parseHistoryDate = (date: string) =>
    parse(date, "dd.MM.yyyy HH:mm", new Date());

  const filteredHistory = (history ?? [])
    .filter((item) => {
      const matchesSearch = item.filename
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = filter === "ALL" || item.status === filter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return compareDesc(
            parseHistoryDate(a.createdAt),
            parseHistoryDate(b.createdAt),
          );

        case "date-asc":
          return compareAsc(
            parseHistoryDate(a.createdAt),
            parseHistoryDate(b.createdAt),
          );

        case "name":
          return a.filename.localeCompare(b.filename);

        case "duration":
          return a.duration - b.duration;
      }
    });

  async function handleDelete() {
    if (!pendingDelete) return;

    const runId = pendingDelete.run_id;

    try {
      setIsDeleting(true);

      await deleteHistoryItem(runId);

      setHistory((prev) => prev?.filter((item) => item.run_id !== runId) ?? null);
      setPendingDelete(null);
    } catch (error) {
      console.error("Ошибка удаления записи истории:", error);
      alert("Не удалось удалить запись. Проверьте консоль.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <S.Page>
        <S.Content>
          <S.Title>История обработок</S.Title>

          <S.EmptyText>Загрузка...</S.EmptyText>
        </S.Content>
      </S.Page>
    );
  }

  const hasHistory = (history?.length ?? 0) > 0;

  return (
    <S.Page>
      <S.Content>
        <S.Header>
          <S.TitleBlock>
            <S.Title>История обработок</S.Title>

            <S.Subtitle>Все ранее обработанные изображения</S.Subtitle>
          </S.TitleBlock>
        </S.Header>
        <S.Toolbar>
          <S.SearchWrapper>
            <S.SearchInput
              placeholder="Поиск по названию файла..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </S.SearchWrapper>

          <S.RightControls>
            <S.Filters>
              <S.FilterButton
                active={filter === "ALL"}
                onClick={() => setFilter("ALL")}
              >
                Все
              </S.FilterButton>

              <S.FilterButton
                active={filter === "SUCCESS"}
                onClick={() => setFilter("SUCCESS")}
              >
                Успешно
              </S.FilterButton>

              <S.FilterButton
                active={filter === "FAILED"}
                onClick={() => setFilter("FAILED")}
              >
                Ошибка
              </S.FilterButton>
            </S.Filters>

            <S.SortSelect
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="date-desc">Сначала новые</option>
              <option value="date-asc">Сначала старые</option>
              <option value="name">По имени</option>
              <option value="duration">По времени обработки</option>
            </S.SortSelect>
          </S.RightControls>
        </S.Toolbar>
        {!hasHistory && (
          <S.EmptyState>
            <S.EmptyText>
              {error
                ? "Не удалось загрузить историю. Проверьте консоль."
                : "История обработок пока пуста"}
            </S.EmptyText>
          </S.EmptyState>
        )}

        {hasHistory && filteredHistory.length === 0 && (
          <S.EmptyState>
            <S.EmptyText>По заданным условиям ничего не найдено</S.EmptyText>
          </S.EmptyState>
        )}

        <S.CardsContainer>
          {filteredHistory.map((item) => (
            <S.Card key={item.run_id}>
              <S.ImagePreview>
                <img src={buildMediaUrl(item.previewUrl) ?? ""} alt="" />
              </S.ImagePreview>

              <S.CardContent>
                <S.CardHeader>
                  <S.FileName>{item.filename}</S.FileName>

                  <S.CardActions>
                    <S.Status success={item.status === "SUCCESS"}>
                      {item.status === "SUCCESS" ? "Успешно" : "Ошибка"}
                    </S.Status>

                    <S.DeleteButton
                      type="button"
                      title="Удалить запись"
                      aria-label={`Удалить запись ${item.filename}`}
                      onClick={() => setPendingDelete(item)}
                    >
                      <TrashSVG />
                    </S.DeleteButton>
                  </S.CardActions>
                </S.CardHeader>

                <S.InfoGrid>
                  <S.InfoItem>
                    <S.Label>Модель</S.Label>
                    <S.Value>{item.modelName}</S.Value>
                  </S.InfoItem>

                  <S.InfoItem>
                    <S.Label>Дата</S.Label>
                    <S.Value>{item.createdAt}</S.Value>
                  </S.InfoItem>

                  <S.InfoItem>
                    <S.Label>Размер</S.Label>
                    <S.Value>
                      {item.width} × {item.height}
                    </S.Value>
                  </S.InfoItem>

                  <S.InfoItem>
                    <S.Label>Время обработки</S.Label>
                    <S.Value>{item.duration.toFixed(2)} сек.</S.Value>
                  </S.InfoItem>
                </S.InfoGrid>

                <S.Actions>
                  <S.ViewButton
                    onClick={() => navigate(`/metrics/${item.run_id}`)}
                  >
                    Просмотреть результат
                  </S.ViewButton>
                </S.Actions>
              </S.CardContent>
            </S.Card>
          ))}
        </S.CardsContainer>
      </S.Content>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить запись?"
        message={`Запись «${pendingDelete?.filename ?? ""}» и все её результаты будут удалены безвозвратно.`}
        confirmText="Удалить"
        cancelText="Отмена"
        loadingText="Удаление..."
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      />
    </S.Page>
  );
};
