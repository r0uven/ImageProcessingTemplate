import { useLocation, useNavigate } from "react-router-dom";

import {
  BackButtonContainer,
  BackIcon,
  BackText,
} from "./BackButton.styles.tsx";

export const BackButton = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const isLauncher = location.pathname === "/";

  if (isLauncher) return null;

  const handleBack = () => {
    // Со страниц верхнего уровня возвращаемся на главный экран,
    // для вложенных — используем историю браузера.
    if (
      location.pathname.startsWith("/workspace") ||
      location.pathname === "/history"
    ) {
      navigate("/");
      return;
    }

    navigate(-1);
  };

  return (
    <BackButtonContainer onClick={handleBack}>
      <BackIcon>←</BackIcon>

      <BackText>Назад</BackText>
    </BackButtonContainer>
  );
};
