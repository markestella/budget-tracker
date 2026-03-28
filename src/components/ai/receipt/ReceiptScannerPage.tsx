'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptReview } from './ReceiptReview';
import { useReceiptScanMutation, useReceiptConfirmMutation } from '@/hooks/api/useReceiptScanHooks';

interface ScanResult {
  scan: { id: string };
  extracted: { merchantName: string; totalAmount: number; date: string; items: { name: string; amount: number }[]; suggestedCategory: string };
}

export function ReceiptScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const scanMut = useReceiptScanMutation();
  const confirmMut = useReceiptConfirmMutation();

  function handleUpload(file: File) {
    scanMut.mutate(file, {
      onSuccess: (data) => {
        setScanResult(data);
        toast.success('Receipt scanned!');
      },
      onError: () => toast.error('Failed to scan receipt'),
    });
  }

  function handleConfirm(payload: { scanId: string; data: { merchantName?: string; totalAmount: number; date?: string; category?: string; description?: string } }) {
    confirmMut.mutate(payload, {
      onSuccess: () => {
        toast.success('Expense created from receipt');
        setScanResult(null);
      },
      onError: () => toast.error('Failed to create expense'),
    });
  }

  function handleCancel() {
    setScanResult(null);
  }

  if (scanResult) {
    return (
      <ReceiptReview
        scanId={scanResult.scan.id}
        extracted={scanResult.extracted}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isConfirming={confirmMut.isPending}
      />
    );
  }

  return <ReceiptUpload onUpload={handleUpload} isUploading={scanMut.isPending} />;
}
