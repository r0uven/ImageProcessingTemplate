import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CreateAiPage } from "@/pages/create-ai";
import { HistoryPage } from "@/pages/history";
import { LandingPage } from "@/pages/landing";
import { ProcessingMetricsPage } from "@/pages/metrics";
import { SettingsPage } from "@/pages/settings";
import { TrainingProcessPage } from "@/pages/training-process";
import { TrainingResultPage } from "@/pages/training-result";
import { WorkspacePage } from "@/pages/workspace";
import { BackButton } from "@/shared/ui/back-button";

export function AppRouter() {
  return (
    <BrowserRouter>
      <BackButton />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/workspace/:toolId" element={<WorkspacePage />} />

        <Route path="/history" element={<HistoryPage />} />
        <Route path="/neural-networks/create" element={<CreateAiPage />} />
        <Route
          path="/neural-networks/:id/training"
          element={<TrainingProcessPage />}
        />
        <Route path="/training/:id/result" element={<TrainingResultPage />} />
        <Route path="/metrics/:runId" element={<ProcessingMetricsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
