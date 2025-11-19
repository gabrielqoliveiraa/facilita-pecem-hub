import { Search, SlidersHorizontal, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Trilha {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  lessons_count: number;
  is_recommended: boolean;
  color_class: string | null;
}

const Trilhas = () => {
  const [activeTab, setActiveTab] = useState<"todos" | "popular" | "minhas">("todos");
  const [trilhasRecomendadas, setTrilhasRecomendadas] = useState<Trilha[]>([]);
  const [outrasTrilhas, setOutrasTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrilhas();
  }, []);

  const fetchTrilhas = async () => {
    try {
      const { data, error } = await supabase
        .from("trilhas")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const recomendadas = data?.filter((t) => t.is_recommended) || [];
      const outras = data?.filter((t) => !t.is_recommended) || [];

      setTrilhasRecomendadas(recomendadas);
      setOutrasTrilhas(outras);
    } catch (error: any) {
      toast.error("Erro ao carregar trilhas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Trilhas" />
      
      <div className="px-4 py-4 space-y-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquise notícias"
              className="pl-10 h-12 bg-white"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Section Title */}
        <div>
          <h2 className="text-xl font-bold text-navy mb-1">Escolha a trilha</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "todos" ? "default" : "outline"}
            onClick={() => setActiveTab("todos")}
            className="rounded-full"
          >
            Todos
          </Button>
          <Button
            variant={activeTab === "popular" ? "default" : "outline"}
            onClick={() => setActiveTab("popular")}
            className="rounded-full"
          >
            Popular
          </Button>
          <Button
            variant={activeTab === "minhas" ? "default" : "outline"}
            onClick={() => setActiveTab("minhas")}
            className="rounded-full"
          >
            Minhas trilhas
          </Button>
        </div>

        {/* Recommended Trails */}
        <div>
          <h3 className="text-lg font-bold text-navy mb-3">Trilhas recomendadas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Com base no seu perfil, competências e candidaturas.
          </p>
          
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : trilhasRecomendadas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma trilha recomendada</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {trilhasRecomendadas.map((trilha) => (
                <Card key={trilha.id} className={`${trilha.color_class} p-4 text-white relative overflow-hidden`}>
                  <div className="relative z-10 space-y-3">
                    <h4 className="font-bold text-lg leading-tight">
                      {trilha.title}
                    </h4>
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                      Iniciar trilha
                    </Button>
                  </div>
                  {trilha.image_url && (
                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
                      <img src={trilha.image_url} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Other Trails */}
        <div>
          <h3 className="text-lg font-bold text-navy mb-4">Outras trilhas</h3>
          
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : outrasTrilhas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma trilha disponível</p>
          ) : (
            <div className="space-y-3">
              {outrasTrilhas.map((trilha) => (
                <Card key={trilha.id} className="flex items-center gap-3 p-3">
                  {trilha.image_url && (
                    <img
                      src={trilha.image_url}
                      alt={trilha.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-navy mb-1">{trilha.title}</h4>
                    <p className="text-sm text-primary">{trilha.lessons_count} aulas</p>
                  </div>
                  <Button size="icon" className="rounded-full bg-yellow hover:bg-yellow/90 h-12 w-12">
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Trilhas;

