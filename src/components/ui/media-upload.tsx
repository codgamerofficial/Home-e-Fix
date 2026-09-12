import * as React from "react";
import { UploadCloud, X, Image as ImageIcon, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

export interface MediaUploadDropzoneProps {
  label?: string;
  helperText?: string;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  className?: string;
  disabled?: boolean;
}

export function MediaUploadDropzone({
  label,
  helperText = "PNG, JPG, MP4 or PDF up to 10MB each",
  accept = "image/*,video/*,application/pdf",
  maxFiles = 5,
  maxSizeMB = 10,
  files = [],
  onFilesChange,
  className,
  disabled = false,
}: MediaUploadDropzoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: UploadedFile[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    Array.from(fileList).forEach((file) => {
      if (files.length + newFiles.length >= maxFiles) return;
      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the maximum limit of ${maxSizeMB}MB.`);
        return;
      }

      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        type: file.type,
      });
    });

    onFilesChange?.([...files, ...newFiles]);
  };

  const handleRemove = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    onFilesChange?.(updated);
  };

  return (
    <div className={cn("space-y-3 w-full", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground block">
          {label}
        </label>
      )}

      {/* Dropzone Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFileSelect(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border bg-muted/30 hover:bg-muted/60 hover:border-accent/40",
          disabled && "cursor-not-allowed opacity-50 pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
        />

        <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-primary">
          Click to upload or drag & drop photos/videos
        </p>
        <p className="text-xs text-foreground-muted mt-1">{helperText}</p>
        <p className="text-[11px] text-accent font-medium mt-2">
          {files.length}/{maxFiles} files uploaded
        </p>
      </div>

      {/* Previews Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {files.map((file) => {
            const isImage = file.type.startsWith("image/");

            return (
              <div
                key={file.id}
                className="group relative rounded-xl border border-border bg-surface p-2 shadow-xs space-y-1.5 overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-foreground-muted" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file.id);
                    }}
                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white hover:bg-error flex items-center justify-center transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] font-medium text-foreground truncate px-0.5">
                  {file.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
