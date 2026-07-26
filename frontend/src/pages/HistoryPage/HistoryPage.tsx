import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import * as S from "./HistoryPage.styled.tsx";
import { compareAsc, compareDesc, parse } from "date-fns";

interface ProcessingHistoryItem {
  id: number;

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

  // TODO заменить на запрос к backend
  useEffect(() => {
    setTimeout(() => {
      setHistory([
        {
          id: 1,
          filename: "road_001.png",
          modelName: "UNet v1",
          createdAt: "18.06.2026 15:42",
          duration: 0.38,
          width: 512,
          height: 512,
          status: "SUCCESS",
          previewUrl: "/test/A.H.1.bmp",
        },
        {
          id: 2,
          filename: "test.png",
          modelName: "UNet v1",
          createdAt: "18.06.2026 15:40",
          duration: 0.41,
          width: 512,
          height: 512,
          status: "SUCCESS",
          previewUrl: "/test/A.H.1.bmp",
        },
        {
          id: 3,
          filename: "satellite.png",
          modelName: "Segmentation AI",
          createdAt: "18.06.2026 14:57",
          duration: 0.62,
          width: 1024,
          height: 1024,
          status: "FAILED",
          previewUrl: "",
        },
      ]);

      setLoading(false);
    }, 700);
  }, []);

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
                <img src={item.previewUrl} alt="" />
              </S.ImagePreview>

              <S.CardContent>
                <S.CardHeader>
                  <S.FileName>{item.filename}</S.FileName>

                  <S.Status success={item.status === "SUCCESS"}>
                    {item.status === "SUCCESS" ? "Успешно" : "Ошибка"}
                  </S.Status>
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
    </S.Page>
  );
};
