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
import { useAppSettings } from "@/entities/settings";

type TrainingStatus = "TRAINING" | "COMPLETED" | "FAILED";

type TrainingProgress = {
  epoch: number;
  loss: number;
  accuracy: number;
  logs: string[];
};

export const TrainingProcessPage = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  const totalEpochs = settings.training.training_params.epochs ?? 100;

  const { id } = useParams();

  const handleOpenResults = () => {
    navigate(`/training/${id}/result`);
  };

  // имитация обучения ( TODO: заменить на websocket)
  const [training, setTraining] = useState<TrainingProgress>({
    epoch: 0,
    loss: 1.0,
    accuracy: 0,
    logs: [],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTraining((prev) => {
        if (prev.epoch >= totalEpochs) {
          // Достигнут конец обучения: состояние не меняется, React
          // пропускает лишний рендер. Интервал остановится при размонтировании.
          return prev;
        }

        const epoch = prev.epoch + 1;
        const loss = Math.max(0.05, prev.loss - Math.random() * 0.02);
        const accuracy = Math.min(0.99, prev.accuracy + Math.random() * 0.01);

        return {
          epoch,
          loss,
          accuracy,
          logs: [
            `[Epoch ${epoch}] loss=${(loss - 0.01).toFixed(4)} acc=${accuracy.toFixed(3)}`,
            ...prev.logs,
          ],
        };
      });
    }, 20);

    return () => clearInterval(interval);
  }, [totalEpochs]);

  const { epoch, loss, accuracy, logs } = training;

  const status: TrainingStatus =
    epoch >= totalEpochs ? "COMPLETED" : "TRAINING";

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
