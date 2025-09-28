// hooks/useDragAndDrop.ts
'use client';

import { useCallback, useState } from 'react';

export const useDragAndDrop = (
  isAdmin: boolean,
  onFilesUpload: (files: File[]) => Promise<void>
) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isAdmin) return;
      e.preventDefault();
      e.stopPropagation();
    },
    [isAdmin]
  );

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!isAdmin) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    },
    [isAdmin]
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!isAdmin) return;
      e.preventDefault();
      e.stopPropagation();

      const { currentTarget, relatedTarget } = e;
      if (!relatedTarget || !currentTarget.contains(relatedTarget as Node)) {
        setIsDragOver(false);
      }
    },
    [isAdmin]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      if (!isAdmin) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      setIsUploading(true);
      try {
        await onFilesUpload(files);
      } finally {
        setIsUploading(false);
      }
    },
    [isAdmin, onFilesUpload]
  );

  return {
    isDragOver,
    isUploading,
    dragHandlers: { onDragOver, onDragEnter, onDragLeave, onDrop },
  };
};
