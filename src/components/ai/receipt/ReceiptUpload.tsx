'use client';

import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';

interface ReceiptUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ReceiptUpload({ onUpload, isUploading }: ReceiptUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file: File | undefined) {
    setError(null);
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be under 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0]);
  }

  function handleSubmit() {
    if (selectedFile) onUpload(selectedFile);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-violet-400 hover:bg-violet-50/30 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-violet-500"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Receipt preview" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <>
            <span className="text-3xl mb-2">📸</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Drop receipt image or click to upload
            </p>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WebP · Max 5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {selectedFile && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{selectedFile.name}</p>
          <Button onClick={handleSubmit} isLoading={isUploading} size="sm">
            🔍 Scan Receipt
          </Button>
        </div>
      )}
    </div>
  );
}
