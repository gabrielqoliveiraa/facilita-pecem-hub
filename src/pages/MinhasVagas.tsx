import { Briefcase, Calendar, MapPin, Building2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Candidatura {
  id: string;
  vaga_id: string;
  status: string;
  created_at: string;
  vaga: {
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    posted_at: string;
  };
}

const MinhasVagas = () => {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"todas" | "pendentes" | "aceitas">("todas");

  useEffect(() => {
    fetchCandidaturas();
  }, []);

  const fetchCandidaturas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const { data, error } = await supabase
        .from("candidaturas")
        .select(`
          *,
          vaga:vagas(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCandidaturas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar candidaturas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aceita":
        return "bg-teal text-white";
      case "pendente":
        return "bg-yellow text-navy";
      case "rejeitada":
        return "bg-destructive text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case "aceita":
        return "Aceita";
      case "pendente":
        return "Em análise";
      case "rejeitada":
        return "Não selecionado";
      default:
        return status;
    }
  };

  const formatData = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const filteredCandidaturas = candidaturas.filter((cand) => {
    if (activeTab === "todas") return true;
    if (activeTab === "pendentes") return cand.status === "pendente";
    if (activeTab === "aceitas") return cand.status === "aceita";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Minhas vagas" />

      <div className="px-4 py-4 space-y-6">
        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-navy to-navy/80 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Candidaturas enviadas</p>
              <p className="text-4xl font-bold">{candidaturas.length}</p>
            </div>
            <Briefcase className="h-12 w-12 opacity-80" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-90">Em análise</p>
              <p className="text-xl font-bold">
                {candidaturas.filter((c) => c.status === "pendente").length}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-90">Aceitas</p>
              <p className="text-xl font-bold">
                {candidaturas.filter((c) => c.status === "aceita").length}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-90">Total</p>
              <p className="text-xl font-bold">{candidaturas.length}</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendentes">Em análise</TabsTrigger>
            <TabsTrigger value="aceitas">Aceitas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : filteredCandidaturas.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma candidatura encontrada
                </p>
              </Card>
            ) : (
              filteredCandidaturas.map((candidatura) => (
                <Card key={candidatura.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-navy text-base mb-1">
                        {candidatura.vaga.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Building2 className="h-4 w-4" />
                        <span>{candidatura.vaga.company}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(candidatura.status)}>
                      {getStatusTexto(candidatura.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{candidatura.vaga.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{candidatura.vaga.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Candidatura enviada {formatData(candidatura.created_at)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-semibold text-primary">
                      {candidatura.vaga.salary}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default MinhasVagas;
