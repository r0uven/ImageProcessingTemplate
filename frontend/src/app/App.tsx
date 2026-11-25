import { SettingsProvider } from "@/entities/settings";

import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <SettingsProvider>
      <AppRouter />
    </SettingsProvider>
  );
}

export default App;
