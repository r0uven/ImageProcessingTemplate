import type { Tool } from "@/types/tool";
import {
  Card,
  CardImage,
  Overlay,
  DeleteButton,
  PlusContent,
  StyledDeleteSVG,
} from "./ToolCard.styles";

interface Props {
  tool?: Tool;

  onClick: () => void;

  onDelete?: () => void;

  isPlus?: boolean;
}

export function ToolCard({ tool, onClick, onDelete, isPlus }: Props) {
  return (
    <Card
      whileHover={{
        scale: 1.03,
      }}
      onClick={onClick}
    >
      {isPlus ? (
        <PlusContent>+</PlusContent>
      ) : (
        <>
          <CardImage src={tool.image} />

          {tool.removable && (
            <DeleteButton
              onClick={(event) => {
                event.stopPropagation();

                onDelete?.();
              }}
            >
              <StyledDeleteSVG />
            </DeleteButton>
          )}

          <Overlay>
            <span>{tool.material}</span>

            <span>{tool.architecture}</span>
          </Overlay>
        </>
      )}
    </Card>
  );
}
