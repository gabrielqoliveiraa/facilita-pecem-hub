import { User, FileText, Award, BookOpen, Briefcase, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { title: "Meu currículo", icon: FileText, path: "/curriculo" },
  { title: "Minhas competências", icon: Award, path: "/competencias" },
  { title: "Minhas trilhas", icon: BookOpen, path: "/minhas-trilhas" },
  { title: "Minhas vagas", icon: Briefcase, path: "/minhas-vagas" },
  { title: "Comunidade e oportunidades", icon: Users, path: "/comunidade" },
];

const UserSidebar = ({ open, onOpenChange }: UserSidebarProps) => {
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
                Lucas da Silva
              </SheetTitle>
              <p className="text-sm text-muted-foreground text-left">
                Caucaia, Ceará, Brasil
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
