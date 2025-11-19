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

  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar notícias");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando notícias...</p>
          ) : noticias.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma notícia disponível</p>
          ) : (
            noticias.map((noticia) => (
              <Card key={noticia.id} className="overflow-hidden">
                {noticia.image_url && (
                  <img
                    src={noticia.image_url}
                    alt={noticia.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-primary font-medium">{formatDate(noticia.published_at)}</p>
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
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Comunidade;
