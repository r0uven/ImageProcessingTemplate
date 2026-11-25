import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ToolCard,
  deleteTool,
  getTools,
  type SegmentationModel,
} from "@/entities/tool";
import { useAsyncData } from "@/shared/lib/useAsyncData";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Page, PageContent, PageHeader } from "@/shared/ui/page";
import { PageTitle } from "@/shared/ui/typography";

import {
  BottomText,
  CardsGrid,
  HeaderActions,
} from "./LandingPage.styles";

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
    } catch (cause) {
      console.error("Ошибка удаления:", cause);
      alert("Не удалось удалить модель. Проверьте консоль.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Page>
      <PageContent $maxWidth="none" $padding="48px" $flex>
        <PageHeader $marginBottom="70px" $align="center">
          <PageTitle>Анализ пористой структуры</PageTitle>

          <HeaderActions>
            <Button
              $variant="secondary"
              onClick={() => {
                navigate("/settings");
              }}
            >
              Настройки
            </Button>

            <Button
              $variant="secondary"
              onClick={() => {
                navigate("/history");
              }}
            >
              Предыдущие обработки
            </Button>
          </HeaderActions>
        </PageHeader>

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
      </PageContent>

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
    </Page>
  );
}
