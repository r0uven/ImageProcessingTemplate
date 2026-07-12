const API_URL = "http://127.0.0.1:8000";

export interface UploadResponse {
  image_id: string;
  preview: string; // base64 preview
  width: number;
  height: number;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload request failed");
  }

  return response.json();
}
