import type { Accept } from "react-dropzone";
import type { FileWithMeta } from "./types";

export function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export function toFileWithMeta(files: File[]): FileWithMeta[] {
  return files.map((file) => ({
    id: generateFileId(file),
    file,
    status: "idle" as const,
    progress: undefined,
    error: undefined,
  }));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${parseFloat(value.toFixed(decimals))} ${sizes[i]}`;
}

export function getFileExtension(fileName: string): string {
  return fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
}

export type FileCategory =
  | "image"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "video"
  | "audio"
  | "archive"
  | "unknown";

export function getFileCategory(file: File): FileCategory {
  const type = file.type;

  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf") return "pdf";
  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";
  if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "spreadsheet";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (
    type === "application/zip" ||
    type === "application/x-rar-compressed" ||
    type === "application/x-tar"
  )
    return "archive";

  return "unknown";
}

export function validateFile(
  file: File,
  {
    maxSize,
    accept,
  }: {
    maxSize?: number;
    accept?: Accept;
  }
): string | null {
  // Check file size
  if (maxSize && file.size > maxSize) {
    return `File size exceeds ${formatBytes(maxSize)} limit.`;
  }

  // Check file type
  if (accept) {
    const mimeTypes = Object.keys(accept);
    const extensions = Object.values(accept).flat();

    const ext = getFileExtension(file.name);
    const mimeMatch = mimeTypes.some((mime) => {
      if (mime.endsWith("/*")) {
        return file.type.startsWith(mime.replace("/*", "/"));
      }
      return file.type === mime;
    });
    const extMatch = extensions.includes(ext);

    if (!mimeMatch && !extMatch) {
      return `File type not supported.`;
    }
  }

  return null;
}

export function removeFileById(
  files: FileWithMeta[],
  id: string
): FileWithMeta[] {
  return files.filter((f) => f.id !== id);
}

export function updateFileProgress(
  files: FileWithMeta[],
  id: string,
  progress: number
): FileWithMeta[] {
  return files.map((f) =>
    f.id === id
      ? {
          ...f,
          progress,
          status: progress === 100 ? "success" : "uploading",
        }
      : f
  );
}

export function updateFileStatus(
  files: FileWithMeta[],
  id: string,
  status: FileWithMeta["status"],
  error?: string
): FileWithMeta[] {
  return files.map((f) => (f.id === id ? { ...f, status, error } : f));
}
