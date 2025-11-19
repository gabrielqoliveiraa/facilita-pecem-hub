import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase } from "lucide-react";

const Vagas = () => {
  const vagas = [
    {
      id: 1,
      title: "Operador de Logística",
      company: "Porto do Pecém",
      location: "São Gonçalo do Amarante",
      type: "Tempo integral",
      salary: "R$ 2.500 - R$ 3.500",
      posted: "Há 2 dias"
    },
    {
      id: 2,
      title: "Técnico em Manutenção",
      company: "ZPE Ceará",
      location: "Complexo do Pecém",
      type: "Tempo integral",
      salary: "R$ 3.000 - R$ 4.500",
      posted: "Há 5 dias"
    },
    {
      id: 3,
      title: "Assistente Administrativo",
      company: "CIPP",
      location: "Pecém",
      type: "Tempo integral",
      salary: "R$ 2.000 - R$ 2.800",
      posted: "Há 1 semana"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Vagas" />
      
      <div className="px-4 py-4 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy mb-1">Vagas disponíveis</h2>
          <p className="text-sm text-muted-foreground">
            {vagas.length} oportunidades encontradas
          </p>
        </div>

        <div className="space-y-4">
          {vagas.map((vaga) => (
            <Card key={vaga.id} className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-navy mb-1">{vaga.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{vaga.company}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{vaga.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{vaga.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{vaga.posted}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-semibold text-primary">{vaga.salary}</span>
                <Button>Candidatar-se</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Vagas;
