import { Award, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Competencia {
  id: string;
  nome: string;
  nivel: number;
  categoria: string;
  emProgresso: boolean;
}

const Competencias = () => {
  const [competencias, setCompetencias] = useState<Competencia[]>([
    {
      id: "1",
      nome: "Comunicação",
      nivel: 75,
      categoria: "Soft Skills",
      emProgresso: true,
    },
    {
      id: "2",
      nome: "Trabalho em Equipe",
      nivel: 60,
      categoria: "Soft Skills",
      emProgresso: true,
    },
    {
      id: "3",
      nome: "Excel Básico",
      nivel: 90,
      categoria: "Técnicas",
      emProgresso: false,
    },
    {
      id: "4",
      nome: "Atendimento ao Cliente",
      nivel: 85,
      categoria: "Técnicas",
      emProgresso: false,
    },
    {
      id: "5",
      nome: "Liderança",
      nivel: 45,
      categoria: "Soft Skills",
      emProgresso: true,
    },
  ]);

  const competenciasEmProgresso = competencias.filter((c) => c.emProgresso);
  const competenciasCompletas = competencias.filter((c) => !c.emProgresso);

  const getNivelTexto = (nivel: number) => {
    if (nivel >= 80) return "Avançado";
    if (nivel >= 50) return "Intermediário";
    return "Iniciante";
  };

  const getNivelCor = (nivel: number) => {
    if (nivel >= 80) return "bg-teal text-white";
    if (nivel >= 50) return "bg-yellow text-navy";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Minhas competências" />

      <div className="px-4 py-4 space-y-6">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-teal to-teal/80 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Total de competências</p>
              <p className="text-4xl font-bold">{competencias.length}</p>
            </div>
            <Award className="h-12 w-12 opacity-80" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-90">Em progresso</p>
              <p className="text-xl font-bold">{competenciasEmProgresso.length}</p>
            </div>
            <div>
              <p className="text-xs opacity-90">Completas</p>
              <p className="text-xl font-bold">{competenciasCompletas.length}</p>
            </div>
          </div>
        </Card>

        {/* Add New Competencia */}
        <Button className="w-full bg-navy hover:bg-navy/90 text-white">
          <Plus className="h-5 w-5 mr-2" />
          Adicionar nova competência
        </Button>

        {/* Competências em Progresso */}
        {competenciasEmProgresso.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-navy mb-4">Em desenvolvimento</h2>
            <div className="space-y-3">
              {competenciasEmProgresso.map((comp) => (
                <Card key={comp.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-navy mb-1">{comp.nome}</h3>
                      <Badge variant="outline" className="text-xs">
                        {comp.categoria}
                      </Badge>
                    </div>
                    <Badge className={getNivelCor(comp.nivel)}>
                      {getNivelTexto(comp.nivel)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-navy">{comp.nivel}%</span>
                    </div>
                    <Progress value={comp.nivel} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Competências Completas */}
        {competenciasCompletas.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-navy mb-4">Competências adquiridas</h2>
            <div className="space-y-3">
              {competenciasCompletas.map((comp) => (
                <Card key={comp.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-navy mb-1">{comp.nome}</h3>
                      <Badge variant="outline" className="text-xs">
                        {comp.categoria}
                      </Badge>
                    </div>
                    <Badge className={getNivelCor(comp.nivel)}>
                      {getNivelTexto(comp.nivel)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nível</span>
                      <span className="font-semibold text-navy">{comp.nivel}%</span>
                    </div>
                    <Progress value={comp.nivel} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Competencias;
