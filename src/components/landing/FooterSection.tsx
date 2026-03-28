'use client';

import Link from 'next/link';

const footerLinks = {
  Features: [
    { label: 'Income Manager', href: '#features' },
    { label: 'Budget Tracker', href: '#features' },
    { label: 'Expense Tracker', href: '#features' },
    { label: 'Savings Goals', href: '#features' },
  ],
  Community: [
    { label: 'Leaderboards', href: '#social' },
    { label: 'Guilds', href: '#social' },
    { label: 'Challenges', href: '#social' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
  ],
};

export function FooterSection() {
  return (
    <footer className="bg-slate-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="text-lg font-bold">MoneyQuest</span>
            </div>
            <p className="text-sm text-slate-400">
              Your gamified finance companion — track, plan, and level up your money.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} MoneyQuest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
