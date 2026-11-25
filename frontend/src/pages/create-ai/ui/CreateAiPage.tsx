import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAppSettings } from "@/entities/settings";
import { DatasetPairList, useDatasetPairs } from "@/features/ai-dataset";

import {
  Card,
  CardTitle,
  Content,
  Field,
  FieldsGrid,
  Header,
  Input,
  Label,
  Layout,
  MainColumn,
  Page,
  Sidebar,
  Subtitle,
  TextArea,
  Title,
  TitleBlock,
} from "./CreateAiPage.styles";
import {
  CreateButton,
  StatLabel,
  StatRow,
  StatsList,
  StatValue,
} from "./CreateAiSidebar.styles";

export const CreateAiPage = () => {
  const navigate = useNavigate();
  const { settings } = useAppSettings();

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

    navigate("/neural-networks/temp-id/training");
  };

  return (
    <Page>
      <Content>
        <Header>
          <TitleBlock>
            <Title>Создание новой нейросети</Title>

            <Subtitle>
              Настройте параметры обучения и загрузите обучающий набор данных
            </Subtitle>
          </TitleBlock>
        </Header>

        <Layout>
          <MainColumn>
            <Card>
              <CardTitle>Информация о модели</CardTitle>

              <Field>
                <Label>Название модели</Label>

                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Например: Segmentation V1"
                />
              </Field>

              <Field>
                <Label>Описание</Label>

                <TextArea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Описание модели"
                />
              </Field>
            </Card>

            <Card>
              <CardTitle>Параметры обучения</CardTitle>

              <FieldsGrid>
                <Field>
                  <Label>Количество эпох</Label>

                  <Input
                    type="number"
                    value={epochs}
                    onChange={(event) => setEpochs(Number(event.target.value))}
                  />
                </Field>

                <Field>
                  <Label>Размер батча</Label>

                  <Input
                    type="number"
                    value={batchSize}
                    onChange={(event) => setBatchSize(Number(event.target.value))}
                  />
                </Field>

                <Field>
                  <Label>Learning Rate</Label>

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
            </Card>

            <Card>
              <CardTitle>Обучающая выборка</CardTitle>

              <DatasetPairList
                pairs={datasetPairs}
                imageFormats={trainingSettings.allowed_image_formats}
                maskFormats={trainingSettings.allowed_mask_formats}
                onOriginalChange={updateOriginal}
                onMaskChange={updateMask}
              />
            </Card>
          </MainColumn>

          <Sidebar>
            <Card>
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

              <CreateButton onClick={handleCreate}>
                Создать нейросеть
              </CreateButton>
            </Card>
          </Sidebar>
        </Layout>
      </Content>
    </Page>
  );
};
