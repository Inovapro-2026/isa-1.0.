import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  FileText, 
  HeadphonesIcon, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isAdmin?: boolean;
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
  { icon: Bot, label: "Meu WhatsApp", path: "/whatsapp-bot" },
  { icon: MessageSquare, label: "Memória de IA", path: "/memoria-ia" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: FileText, label: "Solicitações", path: "/requests" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: HeadphonesIcon, label: "Suporte", path: "/support" },
  { icon: BarChart3, label: "Relatórios", path: "/reports" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

const clientMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/client" },
  { icon: Bot, label: "Meu WhatsApp", path: "/client/whatsapp" },
  { icon: HeadphonesIcon, label: "Meu Suporte", path: "/client/support" },
  { icon: Settings, label: "Meu Perfil", path: "/client/profile" },
];

export function Sidebar({ isAdmin = true }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = isAdmin ? adminMenuItems : clientMenuItems;

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-button flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-xl font-bold">ISA</span>}
        </Link>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start gap-3", collapsed && "justify-center")}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
