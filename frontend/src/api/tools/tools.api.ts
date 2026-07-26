
import type { Tool } from "../../types/tool";
import { client } from "../client";

export async function getTools() {
  const { data } = await client.get<Tool[]>("/tools");
  return data;
}

export async function deleteTool(id: string) {
  await client.delete(`/tools/${id}`);
}