'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  noPadding?: boolean;
  title?: string;
  description?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

function PageContainerComponent({
  children,
  className,
  maxWidth = '2xl',
  noPadding = false,
  title,
  description,
}: PageContainerProps) {
  return (
    <div className={clsx(
      'min-h-screen w-full',
      // Bottom padding for mobile bottom nav
      'pb-20 lg:pb-0',
      // Background
      'bg-slate-900',
      className
    )}>
      <div className={clsx(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        !noPadding && 'px-4 py-6 lg:px-8 lg:py-8'
      )}>
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
            {description && <p className="text-slate-400 mt-1">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// Named export
export { PageContainerComponent as PageContainer };

// Default export for backward compatibility
export default PageContainerComponent;
