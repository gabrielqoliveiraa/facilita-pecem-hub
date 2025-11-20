import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Briefcase, 
  GraduationCap, 
  Newspaper, 
  Users,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/vagas", icon: Briefcase, label: "Vagas" },
    { path: "/admin/trilhas", icon: GraduationCap, label: "Trilhas" },
    { path: "/admin/noticias", icon: Newspaper, label: "Notícias" },
    { path: "/admin/usuarios", icon: Users, label: "Usuários" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-8">
          <img src={logo} alt="FacilitaPecem" className="h-12 mx-auto mb-2" />
          <p className="text-center text-sm text-muted-foreground">Painel Admin</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
