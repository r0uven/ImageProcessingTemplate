import { useEffect, useRef, useState } from "react";

import * as S from "./ImageComparison.styled.tsx";
import type { TrainingState } from "../TrainingResultPage.tsx";

// interface ImageComparisonProps {
//   mask: string;

//   prediction: string;
// }
// interface ImageComparisonProps {
//   leftImage: string;

//   rightImage: string;

//   leftLabel?: string;

//   rightLabel?: string;
// }
interface Props {
  images: TrainingState[];
}

export const ImageComparison = ({ images }: Props) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images[currentImageIndex];

  const handlePreviousImage = () => {
    if (currentImageIndex === 0) {
      return;
    }

    setCurrentImageIndex((prev) => prev - 1);
  };

  const handleNextImage = () => {
    if (currentImageIndex === images.length - 1) {
      return;
    }

    setCurrentImageIndex((prev) => prev + 1);
  };

  const [position, setPosition] = useState(50);

  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    const percent = ((clientX - rect.left) / rect.width) * 100;

    setPosition(Math.max(0, Math.min(100, percent)));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);

    updatePosition(event.clientX);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }

    updatePosition(event.clientX);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // const handleMouseLeave = () => {
  //   setDragging(false);
  // };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging) return;

      updatePosition(e.clientX);
    };

    const up = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging]);

  return (
    <>
      <S.CardTitle>Проверка модели на тестовой выборке</S.CardTitle>

      <S.PreviewContainer>
        <S.ImagesGrid>
          <S.ImageCard>
            <S.ImageTitle>Исходное изображение</S.ImageTitle>

            <S.ImageWrapper>
              <img src={currentImage.original} alt="" />
            </S.ImageWrapper>
          </S.ImageCard>

          <S.ImageCard>
            <S.ImageTitle>Сравнение</S.ImageTitle>

            <S.Viewer
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              // onMouseLeave={handleMouseLeave}
            >
              <S.BaseImage src={currentImage.mask} alt="" draggable={false} />

              <S.Overlay
                style={{
                  clipPath: `inset(0 0 0 ${position}%)`,
                }}
              >
                <S.OverlayImage
                  src={currentImage.prediction}
                  alt=""
                  draggable={false}
                />
              </S.Overlay>

              <S.Divider
                style={{
                  left: `${position}%`,
                }}
              />

              <S.Handle
                style={{
                  left: `${position}%`,
                }}
              >
                ⇆
              </S.Handle>
            </S.Viewer>

            <S.Labels>
              <span>Эталон</span>

              <span>Предсказание</span>
            </S.Labels>
          </S.ImageCard>
        </S.ImagesGrid>

        <S.PerImageMetrics>
          <S.PerImageMetric>
            Accuracy: {currentImage.accuracy.toFixed(2)}%
          </S.PerImageMetric>

          <S.PerImageMetric>
            IoU: {currentImage.iou.toFixed(2)}%
          </S.PerImageMetric>

          <S.PerImageMetric>
            Dice: {currentImage.dice.toFixed(2)}%
          </S.PerImageMetric>
        </S.PerImageMetrics>

        <S.Navigation>
          <S.NavButton
            disabled={currentImageIndex === 0}
            onClick={handlePreviousImage}
          >
            ← Предыдущее
          </S.NavButton>

          <S.ImageCounter>
            {currentImageIndex + 1} / {images.length}
          </S.ImageCounter>

          <S.NavButton
            disabled={currentImageIndex === images.length - 1}
            onClick={handleNextImage}
          >
            Следующее →
          </S.NavButton>
        </S.Navigation>
      </S.PreviewContainer>
    </>
  );
};
