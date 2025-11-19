import { Play, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface TrilhaEmProgresso {
  id: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  color: string;
  timeToday: string;
}

const MinhasTrilhas = () => {
  // Mock data - será substituído por dados reais do Supabase depois
  const trilhasEmProgresso: TrilhaEmProgresso[] = [
    {
      id: "1",
      title: "Matemática básica",
      completedLessons: 14,
      totalLessons: 24,
      color: "bg-cyan-400",
      timeToday: "60min",
    },
    {
      id: "2",
      title: "Guia LinkedIn básico",
      completedLessons: 12,
      totalLessons: 18,
      color: "bg-orange-300",
      timeToday: "45min",
    },
    {
      id: "3",
      title: "Produção industrial",
      completedLessons: 10,
      totalLessons: 16,
      color: "bg-yellow-400",
      timeToday: "30min",
    },
    {
      id: "4",
      title: "Marketing digital",
      completedLessons: 10,
      totalLessons: 16,
      color: "bg-green-400",
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
      <Header title="Minhas trilhas" />
      
      <div className="px-4 py-4 space-y-6">
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
                className={`${trilha.color} p-4 text-white relative overflow-hidden`}
              >
                <div className="relative z-10 space-y-3">
                  <h4 className="font-bold text-base leading-tight min-h-[40px]">
                    {trilha.title}
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(trilha.completedLessons, trilha.totalLessons)}%` }}
                      />
                    </div>
                    
                    <p className="text-sm font-medium">
                      Completo {trilha.completedLessons}/{trilha.totalLessons}
                    </p>
                  </div>
                  
                  <Button 
                    size="icon" 
                    className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm h-12 w-12"
                  >
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MinhasTrilhas;
