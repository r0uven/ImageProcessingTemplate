import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Title,
  Subtitle,
  Field,
  Label,
  Input,
  TextArea,
  PairTitle,
  CreateButton,
  Content,
  Page,
  Header,
  TitleBlock,
  StatRow,
  Card,
  CardTitle,
  DatasetContainer,
  DatasetPair,
  FieldsGrid,
  HiddenInput,
  Layout,
  MainColumn,
  PairHeader,
  PairReady,
  PreviewImage,
  Sidebar,
  StatLabel,
  StatsList,
  StatValue,
  UploadArea,
  UploadGrid,
  UploadHint,
  UploadTitle,
} from "./CreateAiPage.styled";
import { validateMask } from "./utils/validateMask";

interface DatasetPair {
  id: string;
  original?: File;
  originalUrl?: string;
  mask?: File;
  maskUrl?: string;
}

export const CreateAiPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(8);
  const [learningRate, setLearningRate] = useState(0.001);

  const [datasetPairs, setDatasetPairs] = useState<DatasetPair[]>([
    {
      id: crypto.randomUUID(),
    },
  ]);

  // Ссылка на актуальный список пар — нужна, чтобы при размонтировании
  // страницы освободить object URL загруженных файлов.
  const datasetPairsRef = useRef(datasetPairs);

  useEffect(() => {
    datasetPairsRef.current = datasetPairs;
  }, [datasetPairs]);

  useEffect(() => {
    return () => {
      for (const pair of datasetPairsRef.current) {
        if (pair.originalUrl) {
          URL.revokeObjectURL(pair.originalUrl);
        }

        if (pair.maskUrl) {
          URL.revokeObjectURL(pair.maskUrl);
        }
      }
    };
  }, []);

  const updateOriginal = (
    pairId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const target = datasetPairs.find((pair) => pair.id === pairId);

    if (target?.originalUrl) {
      URL.revokeObjectURL(target.originalUrl);
    }

    const url = URL.createObjectURL(file);

    setDatasetPairs((prev) =>
      prev.map((pair) =>
        pair.id === pairId
          ? {
              ...pair,
              original: file,
              originalUrl: url,
            }
          : pair,
      ),
    );
  };

  const updateMask = async (
    pairId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isValid = await validateMask(file);

    if (!isValid) {
      alert("Эталонная маска должна быть черно-белым изображением.");
      return;
    }

    const target = datasetPairs.find((pair) => pair.id === pairId);

    if (target?.maskUrl) {
      URL.revokeObjectURL(target.maskUrl);
    }

    const url = URL.createObjectURL(file);

    setDatasetPairs((prev) => {
      const updated = prev.map((pair) =>
        pair.id === pairId
          ? {
              ...pair,
              mask: file,
              maskUrl: url,
            }
          : pair,
      );

      const last = updated[updated.length - 1];

      if (last.original && last.mask) {
        updated.push({
          id: crypto.randomUUID(),
        });
      }

      return updated;
    });
  };

  const handleCreate = () => {
    const completedPairs = datasetPairs.filter(
      (pair) => pair.original && pair.mask,
    );

    if (!name.trim()) {
      alert("Введите название модели");
      return;
    }

    if (!completedPairs.length) {
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Segmentation V1"
                />
              </Field>

              <Field>
                <Label>Описание</Label>

                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                    onChange={(e) => setEpochs(Number(e.target.value))}
                  />
                </Field>

                <Field>
                  <Label>Размер батча</Label>

                  <Input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                  />
                </Field>

                <Field>
                  <Label>Learning Rate</Label>

                  <Input
                    type="number"
                    step="0.0001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                  />
                </Field>
              </FieldsGrid>
            </Card>

            <Card>
              <CardTitle>Обучающая выборка</CardTitle>

              <DatasetContainer>
                {datasetPairs.map((pair, index) => (
                  <DatasetPair key={pair.id}>
                    <PairHeader>
                      <PairTitle>Пара изображений #{index + 1}</PairTitle>

                      {pair.original && pair.mask && (
                        <PairReady>✓ Готово</PairReady>
                      )}
                    </PairHeader>

                    <UploadGrid>
                      <div>
                        {!pair.original ? (
                          <UploadArea>
                            <UploadTitle>Исходное изображение</UploadTitle>

                            <UploadHint>Нажмите или перетащите файл</UploadHint>

                            <HiddenInput
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                updateOriginal(pair.id, event)
                              }
                            />
                          </UploadArea>
                        ) : (
                          <PreviewImage src={pair.originalUrl} />
                        )}
                      </div>

                      <div>
                        {pair.original && !pair.mask && (
                          <UploadArea>
                            <UploadTitle>Эталонная маска</UploadTitle>

                            <UploadHint>Нажмите или перетащите файл</UploadHint>

                            <HiddenInput
                              type="file"
                              accept="image/*"
                              onChange={(event) => updateMask(pair.id, event)}
                            />
                          </UploadArea>
                        )}

                        {pair.mask && (
                          <PreviewImage src={pair.maskUrl} />
                        )}
                      </div>
                    </UploadGrid>
                  </DatasetPair>
                ))}
              </DatasetContainer>
            </Card>
          </MainColumn>

          <Sidebar>
            <Card>
              <CardTitle>Статистика</CardTitle>

              <StatsList>
                <StatRow>
                  <StatLabel>Загружено пар</StatLabel>

                  <StatValue>
                    {
                      datasetPairs.filter((pair) => pair.original && pair.mask)
                        .length
                    }
                  </StatValue>
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
