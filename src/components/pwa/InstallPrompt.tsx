'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

import Button from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function isMobileBrowser() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMobileBrowser()) {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setDismissed(false);
    }

    function handleAppInstalled() {
      setDeferredPrompt(null);
      setDismissed(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  if (!deferredPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
      <div className="rounded-[1.75rem] border border-indigo-400/30 bg-slate-950/95 p-4 text-white shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-indigo-200">Add to Home Screen</p>
            <p className="text-sm text-slate-300">
              Install MoneyQuest for faster access, fullscreen launch, and better offline support.
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10"
            onClick={() => setDismissed(true)}
          >
            Not now
          </button>
        </div>
        <div className="mt-4">
          <Button className="w-full" onClick={handleInstall}>
            <Download className="size-4" />
            Add to Home Screen
          </Button>
        </div>
      </div>
    </div>
  );
}
