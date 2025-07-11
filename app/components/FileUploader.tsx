import { useCallback, useRef, useState } from "react";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full gradient-border">
      {/* Drag & Drop Area */}
      <div
        className={`
          relative p-8 text-center transition-all duration-700 cursor-pointer bg-white rounded-2xl min-h-[208px]
          ${isDragOver ? "gradient-hover" : "hover:gradient-hover"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src="/icons/info.svg" alt="upload" className="size-20" />
          </div>

          {selectedFile ? (
            <div
              className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3">
                <img src="/images/pdf.png" alt="upload" className="size-10" />
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button onClick={removeFile} className="p-2 cursor-pointer">
                <img src="/icons/cross.svg" alt="close" className="w-4 h-4 " />
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload </span>or drag
                and drop
              </p>
              <p className="text-lg text-gray-500">PDF (max. 20MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
