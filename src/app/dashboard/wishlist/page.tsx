'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WishlistPage from '@/components/wishlist/WishlistPage';

export default function WishlistDashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.10),_transparent_22%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WishlistPage />
        </div>
      </div>
    </DashboardLayout>
  );
}
