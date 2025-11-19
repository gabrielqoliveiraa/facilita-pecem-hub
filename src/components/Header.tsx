import { User, Bell } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return (
    <header className="sticky top-0 bg-card border-b border-border z-40 px-4 py-3">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold text-navy">{title}</h1>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
