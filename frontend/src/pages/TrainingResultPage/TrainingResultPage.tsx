import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import * as S from "./TrainingResultPage.styled";
import { ImageComparison } from "./ImageComparison/ImageComparison";

export interface TrainingState {
  id: number;

  original: string;

  mask: string;

  prediction: string;

  accuracy: number;

  iou: number;

  dice: number;
}

export const TrainingResultPage = () => {
  const navigate = useNavigate();

  // TODO заменить на backend

  const chartData = useMemo(
    () =>
      Array.from({ length: 100 }, (_, index) => ({
        epoch: index + 1,

        loss: Number((1 / (index * 0.15 + 1)).toFixed(3)),

        accuracy: Number((60 + Math.log(index + 1) * 8).toFixed(2)),
      })),
    [],
  );

  // TODO заменить ответом backend

  const testImages: TrainingState[] = [
    {
      id: 1,

      original: "/test/A.H.1.bmp",

      mask: "/test/ETALON_A.H.1.png",

      prediction: "/test/Seg_A.H.1.jpg",

      accuracy: 98.4,

      iou: 96.8,

      dice: 97.6,
    },

    {
      id: 2,

      original: "/test/original2.png",

      mask: "/test/mask2.png",

      prediction: "/test/prediction2.png",

      accuracy: 97.9,

      iou: 96.1,

      dice: 97.1,
    },

    {
      id: 3,

      original: "/test/original3.png",

      mask: "/test/mask3.png",

      prediction: "/test/prediction3.png",

      accuracy: 98.8,

      iou: 97.3,

      dice: 98.1,
    },
  ];

  const handleSaveModel = () => {
    // TODO запрос на сохранение модели

    navigate("/");
  };

  const handleDiscardModel = () => {
    // TODO удаление временной модели

    navigate("/");
  };

  return (
    <S.Page>
      <S.Content>
        <S.Header>
          <S.HeaderLeft>
            <S.Title>Результаты обучения модели</S.Title>

            <S.Subtitle>
              Ознакомьтесь с результатами обучения и качеством сегментации перед
              сохранением модели.
            </S.Subtitle>
          </S.HeaderLeft>

          <S.Status>Обучение успешно завершено</S.Status>
        </S.Header>
        <S.SuccessBanner>
          Модель успешно обучена. Перед сохранением рекомендуется проверить
          качество работы на тестовой выборке.
        </S.SuccessBanner>
        <S.MetricsGrid>
          <S.MetricCard>
            <S.MetricTitle>Accuracy</S.MetricTitle>

            <S.MetricValue>98.43%</S.MetricValue>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricTitle>IoU</S.MetricTitle>

            <S.MetricValue>96.82%</S.MetricValue>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricTitle>Dice</S.MetricTitle>

            <S.MetricValue>97.61%</S.MetricValue>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricTitle>Loss</S.MetricTitle>

            <S.MetricValue>0.021</S.MetricValue>
          </S.MetricCard>
        </S.MetricsGrid>
        <S.Card>
          <S.CardTitle>График обучения</S.CardTitle>

          <div
            style={{
              width: "100%",
              height: 350,
            }}
          >
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.5)" />

                <YAxis stroke="rgba(255,255,255,0.5)" />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#ff5d5d"
                  strokeWidth={3}
                  dot={false}
                  name="Loss"
                />

                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3a7afe"
                  strokeWidth={3}
                  dot={false}
                  name="Accuracy"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </S.Card>
        <S.Card>
          <ImageComparison images={testImages}></ImageComparison>
        </S.Card>{" "}
        <S.Card>
          <S.CardTitle>Статистика обучения</S.CardTitle>

          <S.StatsGrid>
            <S.StatCard>
              <S.StatLabel>Количество эпох</S.StatLabel>

              <S.StatValue>100</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Batch Size</S.StatLabel>

              <S.StatValue>8</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Learning Rate</S.StatLabel>

              <S.StatValue>0.001</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Размер обучающей выборки</S.StatLabel>

              <S.StatValue>426 пар</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Время обучения</S.StatLabel>

              <S.StatValue>13 мин 48 сек</S.StatValue>
            </S.StatCard>

            <S.StatCard>
              <S.StatLabel>Размер модели</S.StatLabel>

              <S.StatValue>18.4 МБ</S.StatValue>
            </S.StatCard>
          </S.StatsGrid>
        </S.Card>
        <S.Card>
          <S.CardTitle>Заключение</S.CardTitle>

          <S.Subtitle>
            Обученная модель продемонстрировала высокое качество сегментации на
            тестовой выборке. Средние значения Accuracy, IoU и Dice
            свидетельствуют о хорошей способности модели к обобщению и
            корректному выделению объектов на ранее не встречавшихся
            изображениях.
          </S.Subtitle>

          <br />

          <S.Subtitle>
            Рекомендуется ознакомиться с результатами сегментации на нескольких
            тестовых изображениях. Если качество соответствует требованиям,
            модель можно сохранить и использовать для дальнейшей обработки
            изображений.
          </S.Subtitle>
        </S.Card>
        <S.Footer>
          <S.CancelButton onClick={handleDiscardModel}>
            Не сохранять
          </S.CancelButton>

          <S.SaveButton onClick={handleSaveModel}>
            Сохранить модель
          </S.SaveButton>
        </S.Footer>
      </S.Content>
    </S.Page>
  );
};
