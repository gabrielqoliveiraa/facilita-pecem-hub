import { User, FileText, Award, BookOpen, Briefcase, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { title: "Meu currículo", icon: FileText, path: "/meu-curriculo" },
  { title: "Minhas competências", icon: Award, path: "/competencias" },
  { title: "Minhas trilhas", icon: BookOpen, path: "/minhas-trilhas" },
  { title: "Minhas vagas", icon: Briefcase, path: "/minhas-vagas" },
  { title: "Comunidade e oportunidades", icon: Users, path: "/comunidade" },
];

const UserSidebar = ({ open, onOpenChange }: UserSidebarProps) => {
  const [userName, setUserName] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nome, bairro")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.nome);
          setUserLocation(profile.bairro ? `${profile.bairro}, Ceará, Brasil` : "Ceará, Brasil");
        }
      }
    };
    
    if (open) {
      fetchUserData();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] bg-background">
        <SheetHeader className="border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <SheetTitle className="text-left text-lg font-bold text-navy">
                {userName || "Usuário"}
              </SheetTitle>
              <p className="text-sm text-muted-foreground text-left">
                {userLocation}
              </p>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
              activeClassName="bg-muted text-primary font-medium"
              onClick={() => onOpenChange(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default UserSidebar;
