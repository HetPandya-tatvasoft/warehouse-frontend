import type {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import type { DropzoneOptions } from "react-dropzone";

export type FileWithMeta = {
  id: string;
  file: File;
  progress?: number;
  error?: string;
  status: "idle" | "uploading" | "success" | "error";
};

export type UploadProgress = Record<string, number>;

export type UIFileUploadFieldProps = {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  fieldProps?: React.ComponentProps<typeof Field>;
  fieldLabelProps?: React.ComponentProps<typeof FieldLabel>;
  fieldDescriptionProps?: React.ComponentProps<typeof FieldDescription>;
  fieldErrorProps?: React.ComponentProps<typeof FieldError>;
};

export type UIFileUploadProps = UIFileUploadFieldProps & {
  files: FileWithMeta[];
  onFilesChange: (file: FileWithMeta[]) => void;
  progress?: UploadProgress;
  multiple?: boolean;
  accept?: DropzoneOptions["accept"];
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  dropzoneText?: string;
  className?: string;
};
