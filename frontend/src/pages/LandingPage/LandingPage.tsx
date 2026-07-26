import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { ToolCard } from "../../components/ToolCard/ToolCard";

import type { Tool } from "../../types/tool";

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

export function LandingPage() {
  const navigate = useNavigate();

  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadTools = async () => {
      try {
        const data = await getTools();

        if (isMounted) {
          setTools(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки инструментов:", error);
      }
    };

    loadTools();

    return () => {
      isMounted = false;
    };
  }, []);

  async function removeTool(id: string) {
    try {
      await deleteTool(id);
      setTools((prev) => prev.filter((tool) => tool.id !== id));
    } catch (error) {
      console.error("Ошибка удаления:", error);
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
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => {
                navigate(`/workspace/${tool.id}`);
              }}
              onDelete={() => {
                removeTool(tool.id);
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
    </PageContainer>
  );
}
