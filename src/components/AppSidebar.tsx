
import { Home, DollarSign, Calendar, Users, BarChart3, FileText, Settings } from "lucide-react"
import { useNavigate, useLocation } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { UserProfile } from "@/components/UserProfile"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Finanças",
    url: "/financas",
    icon: DollarSign,
  },
  {
    title: "Eventos",
    url: "/eventos",
    icon: Calendar,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Análises",
    url: "/analises",
    icon: BarChart3,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: FileText,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/e24274e3-3433-4041-a46d-0af3af1a1a65.png" 
            alt="DJ Davizão Logo" 
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="text-lg font-semibold">DJ Davizão</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <button 
                      onClick={() => navigate(item.url)}
                      className="flex items-center w-full"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
