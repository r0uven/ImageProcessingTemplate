import { SettingsProvider } from "@/entities/settings";
import { GlobalStyle } from "@/shared/styles";

import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <>
      <GlobalStyle />
      <SettingsProvider>
        <AppRouter />
      </SettingsProvider>
    </>
  );
}

export default App;
