import type { SegmentationModel } from "../model/types";
import { client } from "@/shared/api/client";

/** Список моделей сегментации, доступных для анализа. */
export async function getTools() {
  const { data } = await client.get<SegmentationModel[]>("/tools");
  return data;
}

/**
 * Удаляет модель. Заголовок `X-Confirm-Delete` защищает от случайного удаления:
 * backend удаляет запись только если он совпадает с id.
 */
export async function deleteTool(id: string) {
  await client.delete(`/tools/${id}`, {
    headers: {
      "X-Confirm-Delete": id,
    },
  });
}
