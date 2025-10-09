// components/product/DragOverlay.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import uploadImages from '../../../../../../../public/icons/upload-icon.svg';

interface DragOverlayProps {
  isDragOver: boolean;
  isUploading: boolean;
}

const DragOverlay = ({ isDragOver, isUploading }: DragOverlayProps) => {
  if (isUploading) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl z-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isDragOver) {
    return (
      <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center z-20">
        <div className="text-center">
          <Image src={uploadImages} alt="" className="w-12 h-12 mx-auto mb-2" />
          <p className="text-blue-600 font-medium">Отпустите чтобы загрузить</p>
        </div>
      </div>
    );
  }

  return null;
};

export default DragOverlay;
