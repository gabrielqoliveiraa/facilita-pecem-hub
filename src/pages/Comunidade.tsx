import { Search, SlidersHorizontal, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Comunidade = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"noticias" | "visitas" | "projetos">("noticias");
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
  const [projetos, setProjetos] = useState<any[]>([]);
  const [meusProjetos, setMeusProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNoticias();
    fetchProjetos();
    fetchMeusProjetos();
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

  const fetchProjetos = async () => {
    try {
      const { data, error } = await supabase
        .from("projetos_sociais")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar projetos");
      console.error(error);
    }
  };

  const fetchMeusProjetos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_projetos_sociais")
        .select(`
          *,
          projetos_sociais (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setMeusProjetos(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar seus projetos");
      console.error(error);
    }
  };

  const handleInscreverProjeto = async (projetoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const { error } = await supabase
        .from("user_projetos_sociais")
        .insert({
          user_id: user.id,
          projeto_id: projetoId,
          status: "inscrito"
        });

      if (error) throw error;
      
      toast.success("Inscrição realizada com sucesso!");
      fetchMeusProjetos();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Você já está inscrito neste projeto");
      } else {
        toast.error("Erro ao se inscrever no projeto");
      }
      console.error(error);
    }
  };

  const handleCancelarInscricao = async (inscricaoId: string) => {
    try {
      const { error } = await supabase
        .from("user_projetos_sociais")
        .delete()
        .eq("id", inscricaoId);

      if (error) throw error;
      
      toast.success("Inscrição cancelada com sucesso!");
      fetchMeusProjetos();
    } catch (error: any) {
      toast.error("Erro ao cancelar inscrição");
      console.error(error);
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
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={activeTab === "noticias" ? "default" : "outline"}
            onClick={() => setActiveTab("noticias")}
            className="rounded-full whitespace-nowrap"
          >
            Notícias
          </Button>
          <Button
            variant={activeTab === "visitas" ? "default" : "outline"}
            onClick={() => setActiveTab("visitas")}
            className="rounded-full whitespace-nowrap"
          >
            Visitas
          </Button>
          <Button
            variant={activeTab === "projetos" ? "default" : "outline"}
            onClick={() => setActiveTab("projetos")}
            className="rounded-full whitespace-nowrap"
          >
            Projetos Sociais
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Notícias Tab */}
          {activeTab === "noticias" && (
            <>
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="w-full h-48" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-10 w-40 rounded-full" />
                      </div>
                    </Card>
                  ))}
                </>
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
                      <h3 className="text-lg font-bold text-foreground leading-tight">
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
            </>
          )}

          {/* Projetos Sociais Tab */}
          {activeTab === "projetos" && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground mb-2">Meus Projetos</h3>
                {meusProjetos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Você ainda não está inscrito em nenhum projeto</p>
                ) : (
                  <div className="space-y-3">
                    {meusProjetos.map((inscricao: any) => (
                      <Card key={inscricao.id} className="p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground">{inscricao.projetos_sociais.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{inscricao.projetos_sociais.location}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Inscrito em {formatDate(inscricao.inscrito_em)}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelarInscricao(inscricao.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-lg font-bold text-foreground mb-2">Projetos Disponíveis</h3>
                {loading ? (
                  <>
                    {[1, 2].map((i) => (
                      <Card key={i} className="p-4 mb-3">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-10 w-32 rounded-full" />
                      </Card>
                    ))}
                  </>
                ) : projetos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum projeto disponível</p>
                ) : (
                  projetos.map((projeto) => {
                    const jaInscrito = meusProjetos.some(
                      (inscricao: any) => inscricao.projeto_id === projeto.id
                    );
                    return (
                      <Card key={projeto.id} className="p-4 mb-3">
                        {projeto.image_url && (
                          <img
                            src={projeto.image_url}
                            alt={projeto.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h4 className="font-bold text-foreground mb-2">{projeto.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{projeto.description}</p>
                        <p className="text-xs text-muted-foreground mb-2">📍 {projeto.location}</p>
                        {projeto.contact_info && (
                          <p className="text-xs text-muted-foreground mb-3">📞 {projeto.contact_info}</p>
                        )}
                        <Button 
                          className="rounded-full" 
                          onClick={() => handleInscreverProjeto(projeto.id)}
                          disabled={jaInscrito}
                        >
                          {jaInscrito ? "Já inscrito" : "Inscrever-se"}
                        </Button>
                      </Card>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Comunidade;
