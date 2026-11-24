import { SettingsProvider } from "./settings/SettingsContext";
import { AppRouter } from "./router/AppRouter";

function App() {
    return (
        <SettingsProvider>
            <AppRouter />
        </SettingsProvider>
    );
}

export default App;
