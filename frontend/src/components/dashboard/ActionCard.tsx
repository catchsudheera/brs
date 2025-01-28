import Link from 'next/link';
import { ReactNode } from 'react';

interface ActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
}

export const ActionCard = ({ href, title, description, icon, disabled }: ActionCardProps) => (
  <Link 
    href={href}
    className={`card bg-base-200 hover:bg-base-300 transition-colors duration-200 p-4 sm:p-6 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 sm:p-3 rounded-lg bg-emerald-500/10">
        {icon}
      </div>
      <div>
        <h3 className="text-sm sm:text-base font-medium">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  </Link>
); 