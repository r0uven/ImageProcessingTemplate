import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as S from "./HistoryPage.styled.tsx";
import { compareAsc, compareDesc, parse } from "date-fns";
import { getHistory } from "@/api/history/getHistory";
import { deleteHistoryItem } from "@/api/history/deleteHistoryItem";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import TrashSVG from "@/assets/TrashSVG.svg?react";

interface ProcessingHistoryItem {
  id: string;

  filename: string;

  modelName: string;

  createdAt: string;

  duration: number;

  width: number;

  height: number;

  status: "SUCCESS" | "FAILED";
  previewUrl: string;
}

export const HistoryPage = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState<ProcessingHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const [filter, setFilter] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL");

  const [pendingDelete, setPendingDelete] =
    useState<ProcessingHistoryItem | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const parseHistoryDate = (date: string) =>
    parse(date, "dd.MM.yyyy HH:mm", new Date());

  const filteredHistory = [...history]
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

        default:
          return 0;
      }
    });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const items = await getHistory();

        if (cancelled) return;

        setHistory(
          items.map((item) => ({
            id: item.run_id,
            filename: item.filename,
            modelName: item.modelName,
            createdAt: item.createdAt,
            duration: item.duration,
            width: item.width,
            height: item.height,
            status: item.status,
            previewUrl: item.previewUrl,
          })),
        );
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete() {
    if (!pendingDelete) return;

    const runId = pendingDelete.id;

    try {
      setIsDeleting(true);

      await deleteHistoryItem(runId);

      setHistory((prev) => prev.filter((item) => item.id !== runId));
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
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date-desc">Сначала новые</option>
              <option value="date-asc">Сначала старые</option>
              <option value="name">По имени</option>
              <option value="duration">По времени обработки</option>
            </S.SortSelect>
          </S.RightControls>
        </S.Toolbar>
        {history.length === 0 && (
          <S.EmptyState>
            <S.EmptyText>История обработок пока пуста</S.EmptyText>
          </S.EmptyState>
        )}

        <S.CardsContainer>
          {filteredHistory.map((item) => (
            <S.Card key={item.id}>
              <S.ImagePreview>
                <img
                  src={
                    item.previewUrl
                      ? `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001"}${item.previewUrl}`
                      : ""
                  }
                  alt=""
                />
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
                  <S.ViewButton onClick={() => navigate(`/history/${item.id}`)}>
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
