
import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 ml-16 md:ml-64">
        {children}
      </main>
    </div>
  );
}
