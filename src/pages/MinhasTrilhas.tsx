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
  progressBarColor: string;
  playButtonColor: string;
  timeToday: string;
}

const MinhasTrilhas = () => {
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
                          background: `linear-gradient(90deg, ${trilha.progressBarColor}33, ${trilha.progressBarColor})`
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
      </div>

      <BottomNav />
    </div>
  );
};

export default MinhasTrilhas;
