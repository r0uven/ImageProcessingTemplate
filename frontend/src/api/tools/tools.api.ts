import type { SegmentationModel } from "../../types/tool";
import { client } from "../client";

export async function getTools() {
  const { data } = await client.get<SegmentationModel[]>("/tools");
  return data;
}

export async function deleteTool(id: string) {
  await client.delete(`/tools/${id}`);
}
