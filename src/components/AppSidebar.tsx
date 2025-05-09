
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  ChartBar, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings, 
  FileText, 
  BarChart4, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      icon: ChartBar,
      label: 'Dashboard',
      path: '/',
    },
    {
      icon: DollarSign,
      label: 'Finanças',
      path: '/financas',
    },
    {
      icon: Calendar,
      label: 'Eventos',
      path: '/eventos',
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clientes',
    },
    {
      icon: BarChart4,
      label: 'Análises',
      path: '/analises',
    },
    {
      icon: FileText,
      label: 'Relatórios',
      path: '/relatorios',
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes',
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar 
        className={cn(
          "h-screen fixed left-0 top-0 z-30 border-r border-border transition-all",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarHeader className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <span className="text-xl font-bold bg-gold-gradient bg-clip-text text-transparent">
                DJ Davizão
              </span>
            )}
            {collapsed && (
              <span className="text-2xl font-bold bg-gold-gradient bg-clip-text text-transparent">
                DJ
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </SidebarHeader>

        <SidebarContent className="px-3 py-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  pathname === item.path
                    ? "bg-gold-gradient text-black font-medium"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            {!collapsed && (
              <>
                <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center">
                  <span className="font-bold text-black">D</span>
                </div>
                <div>
                  <p className="text-sm font-medium">DJ Davizão</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
              </>
            )}
            {collapsed && (
              <div className="h-8 w-8 mx-auto rounded-full bg-gold-gradient flex items-center justify-center">
                <span className="font-bold text-black">D</span>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
