export type Tool = {
  id: string;
  name: string;
  material: string;
  architecture: string;
  image: string;
  removable: boolean;
  createdAt: number;
};

export type ToolRowDB = {
  id: string;
  name: string;
  material: string;
  architecture: string;
  image: string | null;
  removable: number;
  created_at: number;
};
