import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

// Получаем путь к текущей директории
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    watch: {
      ignored: [
        "**/src-tauri/**",
        "**/target/**",
      ],
    },
  },
  plugins: [svgr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
