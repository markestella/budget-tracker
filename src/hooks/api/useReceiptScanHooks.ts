import { useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';

interface ScanResult {
  scan: { id: string; merchantName: string | null; totalAmount: number | null; scanDate: string | null; items: unknown; suggestedCategory: string | null };
  extracted: { merchantName: string; totalAmount: number; date: string; items: { name: string; amount: number }[]; suggestedCategory: string };
}

export function useReceiptScanMutation() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('receipt', file);
      return apiClient<ScanResult>('/api/ai/receipt-scan', { method: 'POST', body: formData });
    },
  });
}

export function useReceiptConfirmMutation() {
  return useMutation({
    mutationFn: ({ scanId, data }: { scanId: string; data: { merchantName?: string; totalAmount: number; date?: string; category?: string; description?: string } }) =>
      apiClient<{ success: boolean }>(`/api/ai/receipt-scan/${scanId}/confirm`, { method: 'POST', body: data }),
  });
}
