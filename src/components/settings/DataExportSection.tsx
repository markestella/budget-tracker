'use client';

import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { DataExportSkeleton } from './SettingsSkeleton';

interface DataExportSectionProps {
  isLoading: boolean;
  lastExportDate: string;
  exportMutation: UseMutationResult<void, Error, 'json' | 'csv' | 'pdf'>;
}

export default function DataExportSection({ isLoading, lastExportDate, exportMutation }: DataExportSectionProps) {
  if (isLoading) {
    return <DataExportSkeleton />;
  }

  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>Download your MoneyQuest data in JSON, CSV, or PDF.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            isLoading={exportMutation.isPending}
            onClick={() => exportMutation.mutate('json')}
            className="justify-start"
          >
            <FileJson className="size-4" />
            Export JSON
          </Button>
          <Button
            isLoading={exportMutation.isPending}
            onClick={() => exportMutation.mutate('csv')}
            variant="outline"
            className="justify-start"
          >
            <FileSpreadsheet className="size-4" />
            Export CSV
          </Button>
          <Button
            isLoading={exportMutation.isPending}
            onClick={() => exportMutation.mutate('pdf')}
            variant="outline"
            className="justify-start"
          >
            <FileText className="size-4" />
            Export PDF
          </Button>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Download className="size-4 text-slate-400" />
            <span>Last export: <span className="font-semibold text-slate-950 dark:text-slate-100">{lastExportDate}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
