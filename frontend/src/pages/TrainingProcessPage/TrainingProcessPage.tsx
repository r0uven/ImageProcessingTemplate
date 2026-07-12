import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardTitle,
  Content,
  Grid,
  Header,
  InfoRow,
  Label,
  Log,
  Logs,
  Main,
  Metric,
  Metrics,
  Page,
  PreviewBox,
  PreviewText,
  ProgressBar,
  ProgressFill,
  ProgressInfo,
  ResultButton,
  Sidebar,
  StatusBadge,
  StatusWrapper,
  Subtitle,
  Title,
  TitleBlock,
  Value,
} from "./TrainingProcessPage.styled";

export const TrainingProcessPage = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const handleOpenResults = () => {
    navigate(`/training/${id}/result`);
  };

  const [status, setStatus] = useState<
    "PENDING" | "TRAINING" | "COMPLETED" | "FAILED"
  >("PENDING");

  const [epoch, setEpoch] = useState(0);
  const [totalEpochs] = useState(100);

  const [loss, setLoss] = useState(1.0);
  const [accuracy, setAccuracy] = useState(0);

  const [logs, setLogs] = useState<string[]>([]);

  // имитация обучения ( TODO: заменить на websocket)
  useEffect(() => {
    setStatus("TRAINING");

    const interval = setInterval(() => {
      setEpoch((prev) => {
        if (prev >= totalEpochs) {
          setStatus("COMPLETED");
          clearInterval(interval);
          return prev;
        }

        const next = prev + 1;

        setLoss((l) => Math.max(0.05, l - Math.random() * 0.02));
        setAccuracy((a) => Math.min(0.99, a + Math.random() * 0.01));

        setLogs((prev) => [
          `[Epoch ${next}] loss=${(loss - 0.01).toFixed(4)} acc=${accuracy.toFixed(3)}`,
          ...prev,
        ]);

        return next;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [accuracy, loss, totalEpochs]);

  const progress = (epoch / totalEpochs) * 100;

  return (
    <Page>
      <Content>
        <Header>
          <TitleBlock>
            <Title>Обучение модели</Title>
            <Subtitle>Model ID: {id}</Subtitle>
          </TitleBlock>

          <StatusBadge status={status}>
            <StatusWrapper>{status}</StatusWrapper>
          </StatusBadge>
        </Header>

        <Grid>
          <Main>
            <Card>
              <CardTitle>Прогресс обучения</CardTitle>

              <ProgressBar>
                <ProgressFill style={{ width: `${progress}%` }} />
              </ProgressBar>

              <ProgressInfo>
                <span>
                  Эпоха: {epoch} / {totalEpochs}
                </span>
                <span>{progress.toFixed(1)}%</span>
              </ProgressInfo>
            </Card>

            <Card>
              <CardTitle>Метрики</CardTitle>

              <Metrics>
                <Metric>
                  <Label>Loss</Label>
                  <Value>{loss.toFixed(4)}</Value>
                </Metric>

                <Metric>
                  <Label>Accuracy</Label>
                  <Value>{accuracy.toFixed(3)}</Value>
                </Metric>
              </Metrics>
            </Card>

            <Card>
              <CardTitle>Журнал обучения</CardTitle>

              <Logs>
                {logs.map((log, i) => (
                  <Log key={i}>{log}</Log>
                ))}
              </Logs>
            </Card>
          </Main>

          <Sidebar>
            <Card>
              <CardTitle>Состояние системы</CardTitle>

              <InfoRow>
                <span>Статус</span>
                <strong>{status}</strong>
              </InfoRow>

              <InfoRow>
                <span>Эпохи</span>
                <strong>{totalEpochs}</strong>
              </InfoRow>

              <InfoRow>
                <span>Текущая эпоха</span>
                <strong>{epoch}</strong>
              </InfoRow>
            </Card>

            {status === "COMPLETED" && (
              <Card>
                <CardTitle>Обучение завершено</CardTitle>

                <PreviewText>
                  Модель успешно обучена.
                  <br />
                  Теперь можно ознакомиться с результатами тестирования и
                  принять решение о сохранении модели.
                </PreviewText>

                <ResultButton onClick={handleOpenResults}>
                  Просмотреть результаты
                </ResultButton>
              </Card>
            )}

            <Card>
              <CardTitle>Предпросмотр</CardTitle>

              <PreviewBox>
                <PreviewText>
                  Здесь можно показывать:
                  <br />• оригинал
                  <br />• маску
                  <br />• предсказание модели
                </PreviewText>
              </PreviewBox>
            </Card>
          </Sidebar>
        </Grid>
      </Content>
    </Page>
  );
};
