'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, ArrowLeft } from 'lucide-react';
import { CsvDropzone } from '@/components/upload/csv-dropzone';
import { uploadCsv } from '@/lib/api';

const banks = [
  { name: 'Тинькофф', color: 'bg-yellow-500' },
  { name: 'Сбер', color: 'bg-emerald-500' },
  { name: 'Альфа', color: 'bg-red-500' },
];

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  async function handleUpload(file: File) {
    setError('');
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await uploadCsv(file);
      clearInterval(progressInterval);
      setProgress(100);

      if (result.error) {
        setError(result.error);
        setUploading(false);
        setProgress(0);
        return;
      }

      // Brief pause to show 100%, then redirect
      setTimeout(() => {
        router.push(`/analysis/${result.data!.upload_id}`);
      }, 500);
    } catch {
      clearInterval(progressInterval);
      setError('Ошибка загрузки. Попробуйте ещё раз.');
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Flame className="h-6 w-6 text-rose-400" />
            <span>cleo-rf</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Дашборд
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-center text-3xl font-bold">Загрузите выписку</h1>
        <p className="mb-12 text-center text-slate-400">
          Скачайте выписку из мобильного банка в формате CSV и перетащите сюда
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-center text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Dropzone */}
        <CsvDropzone onUpload={handleUpload} />

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm text-slate-400">
              <span>Загрузка...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Bank Instructions */}
        <div className="mt-16">
          <h3 className="mb-6 text-center text-lg font-semibold text-slate-300">
            Поддерживаемые банки
          </h3>
          <div className="flex justify-center gap-6">
            {banks.map((bank) => (
              <div key={bank.name} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bank.color} text-lg font-bold text-white`}
                >
                  {bank.name[0]}
                </div>
                <span className="text-sm text-slate-400">{bank.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Откройте приложение банка &rarr; История операций &rarr; Экспорт &rarr; CSV
          </p>
        </div>
      </div>
    </main>
  );
}
