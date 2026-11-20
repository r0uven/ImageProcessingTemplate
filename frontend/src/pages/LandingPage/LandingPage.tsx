import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { ToolCard } from "../../components/ToolCard/ToolCard";
import { ConfirmDialog } from "../../components/ConfirmDialog/ConfirmDialog";

import type { SegmentationModel } from "../../types/tool";

import {
  PageContainer,
  Header,
  Title,
  HistoryButton,
  CardsGrid,
  BottomText,
  Content,
} from "./LandingPage.styles";
import { deleteTool, getTools } from "@/api/tools/tools.api";
import { useAsyncData } from "@/hooks/useAsyncData";

export function LandingPage() {
  const navigate = useNavigate();

  const { data: tools, setData: setTools } = useAsyncData<SegmentationModel[]>(
    getTools,
  );

  const [pendingDelete, setPendingDelete] = useState<SegmentationModel | null>(
    null,
  );

  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!pendingDelete) return;

    const id = pendingDelete.model_id;

    try {
      setIsDeleting(true);

      await deleteTool(id);

      setTools((prev) => prev?.filter((tool) => tool.model_id !== id) ?? null);
      setPendingDelete(null);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить модель. Проверьте консоль.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PageContainer>
      <Content>
        <Header>
          <Title>Анализ пористой структуры</Title>

          <HistoryButton
            onClick={() => {
              navigate("/history");
            }}
          >
            Предыдущие обработки
          </HistoryButton>
        </Header>

        <CardsGrid>
          {(tools ?? []).map((tool) => (
            <ToolCard
              key={tool.model_id}
              tool={tool}
              onClick={() => {
                navigate(`/workspace/${tool.model_id}`);
              }}
              onDelete={() => {
                setPendingDelete(tool);
              }}
            />
          ))}

          <ToolCard
            isPlus
            onClick={() => navigate("/neural-networks/create")}
          />
        </CardsGrid>

        <BottomText>Выберите способ обработки</BottomText>
      </Content>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить нейросеть?"
        message={`Модель «${pendingDelete?.model_name ?? ""}» будет удалена безвозвратно.`}
        confirmText="Удалить"
        cancelText="Отмена"
        loadingText="Удаление..."
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}
