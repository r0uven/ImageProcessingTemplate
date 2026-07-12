import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LandingPage } from "../pages/LandingPage/LandingPage";

import { WorkspacePage } from "../pages/WorkspacePage/WorkspacePage";

import { HistoryPage } from "../pages/HistoryPage/HistoryPage";
import { BackButton } from "../components/BackButton/BackButton";
import { CreateAiPage } from "@/pages/CreateAiPage/CreateAiPage";
import { TrainingProcessPage } from "@/pages/TrainingProcessPage/TrainingProcessPage";
import { TrainingResultPage } from "@/pages/TrainingResultPage/TrainingResultPage";
import { ProcessingMetricsPage } from "@/pages/ProcessingMetricsPage/ProcessingMetricsPage";

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
        <Route path="/metrics" element={<ProcessingMetricsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
