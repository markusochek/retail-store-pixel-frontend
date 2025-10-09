import React from 'react';

interface FileUploadInputProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ fileInputRef }) => {
  return <input hidden={true} type="file" multiple accept="image/*" ref={fileInputRef} />;
};

export default FileUploadInput;
