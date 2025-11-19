import { Search, SlidersHorizontal, Play, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

interface TrilhaEmProgresso {
  id: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  color: string;
  progressBarColor: string;
  playButtonColor: string;
  timeToday: string;
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

  // Mock data para minhas trilhas
  const trilhasEmProgresso: TrilhaEmProgresso[] = [
    {
      id: "1",
      title: "Matemática básica",
      completedLessons: 14,
      totalLessons: 24,
      color: "bg-[#9CD6DA]",
      progressBarColor: "#5BA3A8",
      playButtonColor: "#089CA6",
      timeToday: "60min",
    },
    {
      id: "2",
      title: "Guia LinkedIn básico",
      completedLessons: 12,
      totalLessons: 18,
      color: "bg-[#F4B89E]",
      progressBarColor: "#E89872",
      playButtonColor: "#E67E48",
      timeToday: "45min",
    },
    {
      id: "3",
      title: "Produção industrial",
      completedLessons: 10,
      totalLessons: 16,
      color: "bg-[#F4D88E]",
      progressBarColor: "#E8C35F",
      playButtonColor: "#D9A83D",
      timeToday: "30min",
    },
    {
      id: "4",
      title: "Marketing digital",
      completedLessons: 10,
      totalLessons: 16,
      color: "bg-[#B2E5B0]",
      progressBarColor: "#7BC979",
      playButtonColor: "#3D8A39",
      timeToday: "30min",
    },
  ];

  const totalTimeToday = trilhasEmProgresso.reduce((acc, trilha) => {
    const minutes = parseInt(trilha.timeToday);
    return acc + minutes;
  }, 0);

  const getProgressPercentage = (completed: number, total: number) => {
    return (completed / total) * 100;
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

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === "minhas" ? (
          <>
            {/* Daily Learning Stats */}
            <Card className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Aprendizado do dia</p>
                  <p className="text-3xl font-bold text-navy">{totalTimeToday}min</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">/ 60min</span>
                </div>
              </div>
              <Progress value={(totalTimeToday / 60) * 100} className="mt-3 h-2" />
            </Card>

            {/* Trilhas em Progresso */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4">Continue aprendendo</h2>
              
          <div className="grid grid-cols-2 gap-4">
            {trilhasEmProgresso.map((trilha) => (
              <Card 
                key={trilha.id} 
                className={`${trilha.color} p-5 text-[#14142B] relative overflow-hidden rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]`}
              >
                <div className="relative z-10 space-y-4">
                  <h4 className="font-bold text-lg leading-tight min-h-[44px]">
                    {trilha.title}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="h-2 bg-black/15 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${getProgressPercentage(trilha.completedLessons, trilha.totalLessons)}%`,
                          background: `linear-gradient(90deg, ${trilha.progressBarColor}66, ${trilha.progressBarColor})`
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium opacity-70 mb-1">
                          Completo
                        </p>
                        <p className="text-lg font-bold">
                          {trilha.completedLessons}/{trilha.totalLessons}
                        </p>
                      </div>
                      
                      <Button 
                        size="icon" 
                        className="rounded-full h-12 w-12 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: trilha.playButtonColor }}
                      >
                        <Play className="h-5 w-5 fill-white text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
            </div>
          </>
        ) : (
          <>
            {/* Recommended Trails */}
            <div>
              <h3 className="text-lg font-bold text-navy mb-3">Trilhas recomendadas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Com base no seu perfil, competências e candidaturas.
              </p>
              
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-9 w-28" />
                    </Card>
                  ))}
                </div>
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
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-20 h-20 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </Card>
                  ))}
                </div>
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
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Trilhas;

