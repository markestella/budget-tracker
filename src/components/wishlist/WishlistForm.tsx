'use client';

import React, { useState } from 'react';

interface WishlistFormProps {
  onSubmit: (data: {
    name: string;
    price: number;
    imageUrl?: string;
    productUrl?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    price: number;
    imageUrl?: string | null;
    productUrl?: string | null;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  isSubmitting?: boolean;
}

export default function WishlistForm({ onSubmit, onCancel, initialData, isSubmitting }: WishlistFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [productUrl, setProductUrl] = useState(initialData?.productUrl ?? '');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>(initialData?.priority ?? 'MEDIUM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(price);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) return;

    onSubmit({
      name: name.trim(),
      price: parsed,
      ...(imageUrl.trim() && { imageUrl: imageUrl.trim() }),
      ...(productUrl.trim() && { productUrl: productUrl.trim() }),
      priority,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {initialData ? 'Edit Wishlist Item' : 'Add to Wishlist'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Laptop"
              maxLength={200}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price (₱) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors font-medium
                    ${priority === p
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                >
                  {p === 'HIGH' ? '🔴' : p === 'MEDIUM' ? '🟡' : '⚪'} {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product URL (optional)
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
