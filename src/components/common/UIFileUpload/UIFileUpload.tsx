"use client"

import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileVideo,
  File,
  FileImage,
  X,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { FileWithMeta, UIFileUploadProps } from "./types";
import { useCallback } from "react";
import type {
  FileCategory} from "./utils";
import {
  formatBytes,
  getFileCategory,
  removeFileById,
  toFileWithMeta,
  validateFile,
} from "./utils";
import type { FileRejection } from "react-dropzone";
import { useDropzone } from "react-dropzone";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { UIFieldLabel } from "../UIFieldLabel";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const FILE_ICONS: Record<FileCategory, React.ReactNode> = {
  image: <FileImage className="size-5 text-blue-500" />,
  pdf: <FileText className="size-5 text-red-500" />,
  document: <FileText className="size-5 text-blue-600" />,
  spreadsheet: <FileSpreadsheet className="size-5 text-green-600" />,
  video: <FileVideo className="size-5 text-purple-500" />,
  audio: <FileAudio className="size-5 text-yellow-500" />,
  archive: <FileArchive className="size-5 text-orange-500" />,
  unknown: <File className="size-5 text-muted-foreground" />,
};

export function UIFileUpload({
  label,
  description,
  error,
  required,
  fieldProps,
  fieldLabelProps,
  fieldDescriptionProps,
  fieldErrorProps,

  // file state
  files,
  onFilesChange,
  progress,

  // dropzone config
  multiple = false,
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles,
  disabled = false,

  // customization
  dropzoneText,
  className,
}: UIFileUploadProps) {
  const onDrop = useCallback(
    (
      acceptedFiles: File[],
      rejectedFiles: FileRejection[]
    ) => {
      const newFiles = toFileWithMeta(acceptedFiles).map((f) => {
        const validationError = validateFile(f.file, {
          maxSize,
          accept,
        });

        return validationError
          ? {
              ...f,
              status: "error" as const,
              error: validationError,
            }
          : f;
      });

      const rejectedWithMeta = rejectedFiles.map(({ file, errors }) => ({
        ...toFileWithMeta([file])[0],
        status: "error" as const,
        error: errors[0]?.message ?? "File rejected.",
      }));

      const allNew = [...newFiles, ...rejectedWithMeta];

      if (!multiple) {
        onFilesChange(allNew.slice(0, 1));
      } else {
        const combined = [...files, ...allNew];

        onFilesChange(maxFiles ? combined.slice(0, maxFiles) : combined);
      }
    },
    [files, onFilesChange, multiple, maxFiles, maxSize, accept]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      multiple,
      accept,
      maxSize,
      maxFiles,
      disabled,
    });

  const handleRemove = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onFilesChange(removeFileById(files, id));
    },
    [files, onFilesChange]
  );

  const hasFiles = files.length > 0;
  const isMaxReached = maxFiles ? files.length >= maxFiles : false;

  return (
    <Field className="space-y-1" {...fieldProps}>
      {label && (
        <UIFieldLabel
          label={label}
          required={required}
          fieldLabelProps={fieldLabelProps}
        />
      )}

      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          "cursor-pointer hover:border-ring/50 hover:bg-muted/30",
          isDragActive && !isDragReject && "border-ring bg-muted/40",
          isDragReject && "border-destructive bg-destructive/5",
          error && "border-destructive",
          (disabled || isMaxReached) &&
            "cursor-not-allowed opacity-50 hover:border-border hover:bg-transparent",
          className
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-muted transition-colors",
            isDragActive && !isDragReject && "bg-primary/10",
            isDragReject && "bg-destructive/10"
          )}
        >
          <CloudUpload
            className={cn(
              "size-6 text-muted-foreground transition-colors",
              isDragActive && !isDragReject && "text-primary",
              isDragReject && "text-destructive"
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          {isDragReject ? (
            <p className="text-sm font-medium text-destructive">
              File type not supported
            </p>
          ) : isDragActive ? (
            <p className="text-sm font-medium text-primary">Drop files here</p>
          ) : isMaxReached ? (
            <p className="text-sm font-medium text-muted-foreground">
              Maximum files reached
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">
                {dropzoneText ?? (
                  <>
                    <span className="text-primary">Click to upload</span> or
                    drag and drop
                  </>
                )}
              </p>

              <p className="text-xs text-muted-foreground">
                {accept
                  ? Object.values(accept).flat().join(", ")
                  : "Any file type"}{" "}
                {maxSize && `. Max ${formatBytes(maxSize)}`}
                {maxFiles && ` . Up to ${maxFiles} files`}
              </p>
            </>
          )}
        </div>
      </div>

      {hasFiles && (
        <div className="flex flex-col gap-2 pt-1">
          {files.map((fileWithMeta) => (
            <FileItem
              key={fileWithMeta.id}
              fileWithMeta={fileWithMeta}
              progress={progress?.[fileWithMeta.id]}
              onRemove={handleRemove}
              disabled={disabled}
            />
          ))}
          {/* Description */}
          {description && (
            <FieldDescription {...fieldDescriptionProps}>
              {description}
            </FieldDescription>
          )}

          {/* Error */}
          {error && <FieldError {...fieldErrorProps}>{error}</FieldError>}
        </div>
      )}
    </Field>
  );
}

function FileItem({
  fileWithMeta,
  progress,
  onRemove,
  disabled,
}: {
  fileWithMeta: FileWithMeta;
  progress?: number;
  onRemove: (id: string, e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  const { id, file, status, error } = fileWithMeta;

  // use external progress prop if provided, else use internal
  const currentProgress =
    progress !== undefined ? progress : fileWithMeta.progress;

  const category = getFileCategory(file);
  const icon = FILE_ICONS[category];

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border bg-background p-3 transition-colors",
        status === "error" && "border-destructive/50 bg-destructive/5",
        status === "success" && "border-green-500/30 bg-green-500/5"
      )}
    >
      <div className="flex items-center gap-3">
        {/* File icon */}
        <div className="shrink-0">{icon}</div>

        {/* File info */}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium leading-none">
            {file.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </p>
        </div>

        {/* Status icon + remove */}
        <div className="flex shrink-0 items-center gap-1.5">
          {status === "success" && (
            <CheckCircle2 className="size-4 text-green-500" />
          )}
          {status === "error" && (
            <AlertCircle className="size-4 text-destructive" />
          )}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={(e) => onRemove(id, e)}
              className="rounded text-muted-foreground transition hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {currentProgress !== undefined && status !== "error" && (
        <Progress
          value={currentProgress}
          className={cn("h-1", status === "success" && "[&>div]:bg-green-500")}
        />
      )}

      {/* Per file error */}
      {status === "error" && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
