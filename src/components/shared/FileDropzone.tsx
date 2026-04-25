"use client";

import { useCallback } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: Accept;
  multiple?: boolean;
  maxSize?: number; // bytes
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function FileDropzone({
  accept,
  multiple = false,
  maxSize = 100 * 1024 * 1024, // 100MB default
  onFiles,
  label = "Drop files here, or click to browse",
  sublabel,
  className,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFiles(acceptedFiles);
      }
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      aria-label={label}
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer",
        "transition-colors duration-200",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        className
      )}
    >
      <input {...getInputProps()} />
      {/* aria-hidden: the visual text is redundant with the container's aria-label */}
      <p className="text-lg font-medium text-muted-foreground" aria-hidden="true">
        {isDragActive ? label : label}
      </p>
      {sublabel && (
        <p className="text-sm text-muted-foreground/70 mt-2" aria-hidden="true">
          {sublabel}
        </p>
      )}
      {/* Live region announces drag state to screen readers */}
      <span role="status" aria-live="polite" className="sr-only">
        {isDragActive ? label : ""}
      </span>
    </div>
  );
}
