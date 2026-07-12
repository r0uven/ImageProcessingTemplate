import { db } from "./database";
import type { Tool, ToolRowDB } from "../types/tool";

export async function createTool(tool: Tool) {
  await db.execute(
    `
      INSERT INTO tools (
        id,
        name,
        material,
        architecture,
        image,
        removable,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      tool.id,
      tool.name,
      tool.material,
      tool.architecture,
      tool.image,
      tool.removable ? 1 : 0,
      tool.createdAt,
    ],
  );
}

export async function getAllTools(): Promise<Tool[]> {
  const result = await db.select<ToolRowDB[]>(
    `
      SELECT *
      FROM tools
      ORDER BY created_at DESC
    `,
  );

  return result.map((tool) => ({
    id: tool.id,
    name: tool.name,
    material: tool.material,
    architecture: tool.architecture,
    image: tool.image ?? "",
    removable: !!tool.removable,
    createdAt: tool.created_at,
  }));
}

export async function deleteTool(id: string) {
  await db.execute(
    `
      DELETE FROM tools
      WHERE id = ?
    `,
    [id],
  );
}
