import type { SegmentationModel } from "../model/types";
import { client } from "@/shared/api/client";

export async function getTools() {
  const { data } = await client.get<SegmentationModel[]>("/tools");
  return data;
}

export async function deleteTool(id: string) {
  await client.delete(`/tools/${id}`, {
    headers: {
      "X-Confirm-Delete": id,
    },
  });
}
