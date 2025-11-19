import { Search, SlidersHorizontal, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Comunidade = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"noticias" | "visitas">("noticias");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("nome")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.nome);
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error("Erro ao fazer logout");
    }
  };

  const noticias = [
    {
      id: 1,
      date: "6 de novembro de 2025",
      title: "CIPP e ZPE Ceará concluem 1ª Semana de Integridade com foco em Compliance e Riscos",
      description: "A primeira edição da Semana da Integridade chegou ao fim nesta quinta-feira, 6, no auditório da ZPE Ceará com a realização de atividades relacionadas aos conceitos de Compliance e Gestão de Riscos. O encerramento do evento, voltado para colaboradores do Complexo do Pecém e da ZPE Ceará, contou com a participação de integrantes de toda [...]",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Comunidade" />
      
      <div className="px-4 py-4 space-y-4">
        {/* Welcome message */}
        {userName && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Bem-vindo, <span className="font-semibold text-foreground">{userName}</span>
            </p>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquise notícias"
              className="pl-10 h-12"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "noticias" ? "default" : "outline"}
            onClick={() => setActiveTab("noticias")}
            className="rounded-full"
          >
            Notícias
          </Button>
          <Button
            variant={activeTab === "visitas" ? "default" : "outline"}
            onClick={() => setActiveTab("visitas")}
            className="rounded-full"
          >
            Visitas
          </Button>
        </div>

        {/* News Cards */}
        <div className="space-y-4">
          {noticias.map((noticia) => (
            <Card key={noticia.id} className="overflow-hidden">
              <img
                src={noticia.image}
                alt={noticia.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-3">
                <p className="text-sm text-primary font-medium">{noticia.date}</p>
                <h3 className="text-lg font-bold text-navy leading-tight">
                  {noticia.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {noticia.description}
                </p>
                <Button className="rounded-full">
                  Ver notícia completa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Comunidade;
