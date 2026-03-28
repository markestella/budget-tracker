'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWishlistQuery, useCreateWishlistItem, useAddFunds, useUpdateWishlistItem, useDeleteWishlistItem } from '@/hooks/api/useWishlistHooks';
import WishlistCard from './WishlistCard';
import WishlistForm from './WishlistForm';
import AddFundsDialog from './AddFundsDialog';

type SortOption = 'closest' | 'price-asc' | 'price-desc' | 'priority' | 'newest';

export default function WishlistPage() {
  const { data: items = [], isLoading } = useWishlistQuery();
  const createItem = useCreateWishlistItem();
  const addFunds = useAddFunds();
  const updateItem = useUpdateWishlistItem();
  const deleteItem = useDeleteWishlistItem();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [milestoneToast, setMilestoneToast] = useState<string | null>(null);

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'closest': {
        const remA = Number(a.price) - Number(a.savedAmount);
        const remB = Number(b.price) - Number(b.savedAmount);
        return remA - remB;
      }
      case 'price-asc':
        return Number(a.price) - Number(b.price);
      case 'price-desc':
        return Number(b.price) - Number(a.price);
      case 'priority': {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      }
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleCreate = useCallback((data: { name: string; price: number; imageUrl?: string; productUrl?: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }) => {
    createItem.mutate(data, {
      onSuccess: () => setShowForm(false),
    });
  }, [createItem]);

  const handleAddFunds = useCallback((amount: number) => {
    if (!fundingId) return;
    addFunds.mutate(
      { id: fundingId, amount },
      {
        onSuccess: (data) => {
          setFundingId(null);
          if (data.crossedMilestone) {
            const messages: Record<number, string> = {
              25: '🎯 25% saved! Great start!',
              50: '🔥 Halfway there!',
              75: '💪 75% — Almost there!',
              100: '🎉 You can afford it!',
            };
            setMilestoneToast(messages[data.crossedMilestone] ?? null);
            setTimeout(() => setMilestoneToast(null), 4000);
          }
        },
      },
    );
  }, [fundingId, addFunds]);

  const handleMarkPurchased = useCallback((id: string) => {
    updateItem.mutate({ id, data: { status: 'PURCHASED' as const } });
  }, [updateItem]);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const editingItem = editingId ? items.find((i) => i.id === editingId) : null;
  const fundingItem = fundingId ? items.find((i) => i.id === fundingId) : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎁 Wishlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track what you want and save toward it</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: 'priority', label: 'Priority' },
          { key: 'closest', label: 'Closest to Afford' },
          { key: 'price-asc', label: 'Price ↑' },
          { key: 'price-desc', label: 'Price ↓' },
          { key: 'newest', label: 'Newest' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors
              ${sortBy === key
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎁</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No wishlist items yet — add your first one!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onAddFunds={setFundingId}
                onMarkPurchased={handleMarkPurchased}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Milestone toast */}
      {milestoneToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
          {milestoneToast}
        </div>
      )}

      {/* Dialogs */}
      {showForm && (
        <WishlistForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isSubmitting={createItem.isPending}
        />
      )}

      {editingItem && (
        <WishlistForm
          initialData={{
            name: editingItem.name,
            price: Number(editingItem.price),
            imageUrl: editingItem.imageUrl,
            productUrl: editingItem.productUrl,
            priority: editingItem.priority,
          }}
          onSubmit={(data) => {
            updateItem.mutate(
              { id: editingItem.id, data },
              { onSuccess: () => setEditingId(null) },
            );
          }}
          onCancel={() => setEditingId(null)}
          isSubmitting={updateItem.isPending}
        />
      )}

      {fundingItem && (
        <AddFundsDialog
          itemName={fundingItem.name}
          remaining={Math.max(0, Number(fundingItem.price) - Number(fundingItem.savedAmount))}
          onSubmit={handleAddFunds}
          onCancel={() => setFundingId(null)}
          isSubmitting={addFunds.isPending}
        />
      )}
    </div>
  );
}
