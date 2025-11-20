import { User, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import UserSidebar from "./UserSidebar";
import logo from "@/assets/logo.png";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-12 w-12"
            onClick={() => setSidebarOpen(true)}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </Button>
          
          <img src={logo} alt="FacilitaPecém" className="h-8" />
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <UserSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
};

export default Header;
