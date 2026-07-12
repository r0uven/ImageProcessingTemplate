import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { ToolCard } from "../../components/ToolCard/ToolCard";

import type { Tool } from "../../types/tool";
import { appDataDir } from "@tauri-apps/api/path";

import {
  PageContainer,
  Header,
  Title,
  HistoryButton,
  CardsGrid,
  BottomText,
  Content,
} from "./LandingPage.styles";
import { deleteTool, getAllTools } from "../../database/tools.repository";

export function LandingPage() {
  const navigate = useNavigate();

  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const data = await getAllTools();
      const reverseData = data.toReversed();
      if (mounted) {
        setTools(reverseData);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  async function removeTool(id: string) {
    await deleteTool(id);
    const dir = await appDataDir();

    console.log(dir);
    setTools((prev) => prev.filter((tool) => tool.id !== id));
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
