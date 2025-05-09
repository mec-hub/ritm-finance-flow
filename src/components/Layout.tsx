
import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
     <main className="flex-1 p-4 md:p-6 lg:p-8 pl-16 md:pl-64 w-full">
         <div className="w-full">
    {children}
  </div>
      </main>
    </div>
  );
}
