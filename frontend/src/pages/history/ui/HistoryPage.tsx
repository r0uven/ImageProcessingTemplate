import { useState } from "react";

import { compareAsc, compareDesc, parse } from "date-fns";
import { useNavigate } from "react-router-dom";

import {
  deleteHistoryItem,
  getHistory,
  type HistoryItemResponse,
} from "@/entities/history";
import { useAsyncData } from "@/shared/lib/useAsyncData";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import { HistoryCard } from "./HistoryCard";
import * as S from "./HistoryPage.styles";

type HistoryFilter = "ALL" | "SUCCESS" | "FAILED";
type HistorySort = "date-desc" | "date-asc" | "name" | "duration";

function parseHistoryDate(date: string) {
  return parse(date, "dd.MM.yyyy HH:mm", new Date());
}

export const HistoryPage = () => {
  const navigate = useNavigate();

  const {
    data: history,
    setData: setHistory,
    loading,
    error,
  } = useAsyncData<HistoryItemResponse[]>(getHistory);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<HistorySort>("date-desc");
  const [filter, setFilter] = useState<HistoryFilter>("ALL");
  const [pendingDelete, setPendingDelete] =
    useState<HistoryItemResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } catch (cause) {
      console.error("Ошибка удаления записи истории:", cause);
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
              onChange={(event) => setSearch(event.target.value)}
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
              onChange={(event) => setSort(event.target.value as HistorySort)}
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
            <HistoryCard
              key={item.run_id}
              item={item}
              onDelete={() => setPendingDelete(item)}
              onView={() => navigate(`/metrics/${item.run_id}`)}
            />
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
