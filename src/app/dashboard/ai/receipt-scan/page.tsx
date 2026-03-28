'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FadeIn } from '@/components/animations/FadeIn';
import { ReceiptScannerPage } from '@/components/ai/receipt/ReceiptScannerPage';

export default function ReceiptScanDashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.10),_transparent_28%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <FadeIn className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
              AI Features
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Receipt Scanner
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Snap a photo of your receipt and let AI extract the details
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ReceiptScannerPage />
          </FadeIn>
        </div>
      </div>
    </DashboardLayout>
  );
}
