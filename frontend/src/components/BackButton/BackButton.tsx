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
    if (location.pathname.startsWith("/workspace")) {
      navigate("/");
      return;
    }

    if (location.pathname === "/history") {
      navigate("/");
      return;
    }

    navigate(-1);
  };

  return (
    <BackButtonContainer onClick={handleBack}>
      <BackIcon>←</BackIcon>

      <BackText>Back</BackText>
    </BackButtonContainer>
  );
};
