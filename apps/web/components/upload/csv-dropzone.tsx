'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface CsvDropzoneProps {
  onUpload: (file: File) => void;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function CsvDropzone({ onUpload }: CsvDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndUpload(file: File) {
    setError('');
    setFileName('');

    // Validate type
    const isCSV =
      file.type === 'text/csv' ||
      file.name.toLowerCase().endsWith('.csv');
    if (!isCSV) {
      setError('Пожалуйста, загрузите файл в формате CSV');
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Максимальный размер файла: ${MAX_SIZE_MB} МБ`);
      return;
    }

    setFileName(file.name);
    onUpload(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          dragging
            ? 'border-rose-500 bg-rose-500/10'
            : 'border-slate-700 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <FileSpreadsheet className="h-12 w-12 text-emerald-400" />
            <p className="text-lg font-medium text-emerald-300">{fileName}</p>
            <p className="text-sm text-slate-400">Файл загружается...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload
              className={`h-12 w-12 ${
                dragging ? 'text-rose-400' : 'text-slate-500'
              }`}
            />
            <div>
              <p className="text-lg font-medium text-slate-300">
                Перетащите CSV-файл сюда
              </p>
              <p className="mt-1 text-sm text-slate-500">
                или нажмите, чтобы выбрать файл (макс. {MAX_SIZE_MB} МБ)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
