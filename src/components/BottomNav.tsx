import { Home, BookOpen, Map, Briefcase } from "lucide-react";
import { NavLink } from "./NavLink";

const BottomNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Comunidade" },
    { to: "/trilhas", icon: BookOpen, label: "Trilhas" },
    { to: "/rotas", icon: Map, label: "Rotas" },
    { to: "/vagas", icon: Briefcase, label: "Vagas" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-6 w-6 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
