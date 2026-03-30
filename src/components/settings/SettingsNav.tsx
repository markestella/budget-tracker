'use client';

import { cn } from '@/lib/utils';
import { User, Shield, Sliders, Download, BellRing } from 'lucide-react';

export type SettingsSection = 'profile' | 'security' | 'preferences' | 'data' | 'notifications';

const navItems: Array<{ id: SettingsSection; label: string; icon: React.ElementType }> = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'data', label: 'Data Export', icon: Download },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
];

interface SettingsNavProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

export default function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <>
      {/* Desktop sidebar nav */}
      <nav className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors text-left',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile horizontal scroll nav */}
      <nav className="flex md:hidden gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50',
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
