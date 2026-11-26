import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAppSettings } from "@/entities/settings";
import { DatasetPairList, useDatasetPairs } from "@/features/ai-dataset";
import { Button } from "@/shared/ui/button";
import { Field, FieldLabel, Input, Textarea as TextArea } from "@/shared/ui/field";
import { Page, PageContent, PageHeader, PageTitleBlock } from "@/shared/ui/page";
import { CardTitle, PageSubtitle, PageTitle } from "@/shared/ui/typography";

import { FieldsGrid, FormCard, Layout, MainColumn } from "./CreateAiPage.styles";
import {
  Sidebar,
  StatLabel,
  StatRow,
  StatsList,
  StatValue,
} from "./CreateAiSidebar.styles";

/** Страница создания и обучения новой модели (пока без реального backend). */
export const CreateAiPage = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

  // Значения по умолчанию берутся из настроек training.
  const trainingSettings = settings.training;
  const trainingParams = trainingSettings.training_params;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [epochs, setEpochs] = useState(trainingParams.epochs ?? 100);
  const [batchSize, setBatchSize] = useState(trainingParams.batch_size ?? 8);
  const [learningRate, setLearningRate] = useState(
    trainingParams.learning_rate ?? 0.001,
  );

  const { datasetPairs, completedCount, updateOriginal, updateMask } =
    useDatasetPairs(trainingSettings);

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Введите название модели");
      return;
    }

    if (!completedCount) {
      alert("Добавьте хотя бы одну пару изображений");
      return;
    }

    // TODO: заменить temp-id на id, который вернёт backend после создания модели.
    navigate("/neural-networks/temp-id/training");
  };

  return (
    <Page>
      <PageContent $maxWidth="1400px" $padding="72px 48px 48px">
        <PageHeader $marginBottom="40px">
          <PageTitleBlock>
            <PageTitle>Создание новой нейросети</PageTitle>

            <PageSubtitle>
              Настройте параметры обучения и загрузите обучающий набор данных
            </PageSubtitle>
          </PageTitleBlock>
        </PageHeader>

        <Layout>
          <MainColumn>
            <FormCard>
              <CardTitle>Информация о модели</CardTitle>

              <Field>
                <FieldLabel>Название модели</FieldLabel>

                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Например: Segmentation V1"
                />
              </Field>

              <Field>
                <FieldLabel>Описание</FieldLabel>

                <TextArea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Описание модели"
                />
              </Field>
            </FormCard>

            <FormCard>
              <CardTitle>Параметры обучения</CardTitle>

              <FieldsGrid>
                <Field>
                  <FieldLabel>Количество эпох</FieldLabel>

                  <Input
                    type="number"
                    value={epochs}
                    onChange={(event) => setEpochs(Number(event.target.value))}
                  />
                </Field>

                <Field>
                  <FieldLabel>Размер батча</FieldLabel>

                  <Input
                    type="number"
                    value={batchSize}
                    onChange={(event) => setBatchSize(Number(event.target.value))}
                  />
                </Field>

                <Field>
                  <FieldLabel>Learning Rate</FieldLabel>

                  <Input
                    type="number"
                    step="0.0001"
                    value={learningRate}
                    onChange={(event) =>
                      setLearningRate(Number(event.target.value))
                    }
                  />
                </Field>
              </FieldsGrid>
            </FormCard>

            <FormCard>
              <CardTitle>Обучающая выборка</CardTitle>

              <DatasetPairList
                pairs={datasetPairs}
                imageFormats={trainingSettings.allowed_image_formats}
                maskFormats={trainingSettings.allowed_mask_formats}
                onOriginalChange={updateOriginal}
                onMaskChange={updateMask}
              />
            </FormCard>
          </MainColumn>

          <Sidebar>
            <FormCard>
              <CardTitle>Статистика</CardTitle>

              <StatsList>
                <StatRow>
                  <StatLabel>Загружено пар</StatLabel>

                  <StatValue>{completedCount}</StatValue>
                </StatRow>

                <StatRow>
                  <StatLabel>Эпохи</StatLabel>

                  <StatValue>{epochs}</StatValue>
                </StatRow>

                <StatRow>
                  <StatLabel>Размер батча</StatLabel>

                  <StatValue>{batchSize}</StatValue>
                </StatRow>

                <StatRow>
                  <StatLabel>Learning Rate</StatLabel>

                  <StatValue>{learningRate}</StatValue>
                </StatRow>
              </StatsList>

              <Button
                $variant="primary"
                $size="lg"
                $fullWidth
                onClick={handleCreate}
              >
                Создать нейросеть
              </Button>
            </FormCard>
          </Sidebar>
        </Layout>
      </PageContent>
    </Page>
  );
};
