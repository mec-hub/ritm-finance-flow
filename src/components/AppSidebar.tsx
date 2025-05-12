
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    <div className={cn(
      "h-full border-r border-border transition-all shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/3867e3d9-7903-46de-9705-af9db3e627d0.png" 
                  alt="DJ Davizão Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold bg-gold-gradient bg-clip-text text-transparent">
                  DJ Davizão
                </span>
              </div>
            ) : (
              <img 
                src="/lovable-uploads/3867e3d9-7903-46de-9705-af9db3e627d0.png" 
                alt="DJ Logo" 
                className="h-8 w-auto mx-auto"
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={collapsed ? "ml-auto" : ""}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
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
        </div>

        <div className="p-4 border-t border-border">
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
        </div>
      </div>
    </div>
  );
}
