import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Vaga {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted_at: string;
}

const Vagas = () => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVagas();
  }, []);

  const fetchVagas = async () => {
    try {
      const { data, error } = await supabase
        .from("vagas")
        .select("*")
        .eq("is_active", true)
        .order("posted_at", { ascending: false });

      if (error) throw error;
      setVagas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar vagas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPostedDate = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Vagas" />
      
      <div className="px-4 py-4 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy mb-1">Vagas disponíveis</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${vagas.length} oportunidades encontradas`}
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 space-y-4">
                  <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </Card>
              ))}
            </>
          ) : vagas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma vaga disponível no momento</p>
          ) : (
            vagas.map((vaga) => (
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
                    <span>{formatPostedDate(vaga.posted_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold text-primary">{vaga.salary}</span>
                  <Button>Candidatar-se</Button>
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

export default Vagas;
