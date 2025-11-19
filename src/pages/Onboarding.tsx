import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [idade, setIdade] = useState("");
  const [bairro, setBairro] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const [temInternet, setTemInternet] = useState(false);
  const [temTransporte, setTemTransporte] = useState(false);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState("");

  const interessesOptions = [
    "Energia",
    "Portos",
    "Logística",
    "Manutenção",
    "Administrativo",
    "Operações"
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.id);
      }
    };
    checkAuth();
  }, [navigate]);

  const toggleInteresse = (interesse: string) => {
    setInteresses(prev =>
      prev.includes(interesse)
        ? prev.filter(i => i !== interesse)
        : [...prev, interesse]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idade || !bairro || !escolaridade || !experiencia || interesses.length === 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!userId) {
      toast.error("Erro ao identificar usuário");
      return;
    }

    setLoading(true);

    try {
      // Mock AI analysis
      const suggestedRoles = ["Logística", "Operações", "Manutenção"];
      
      const { error } = await supabase
        .from("profiles")
        .update({
          idade: parseInt(idade),
          bairro,
          escolaridade,
          experiencia,
          interesses,
          tem_internet: temInternet,
          tem_transporte: temTransporte,
          horarios_disponiveis: horariosDisponiveis,
          sugestoes_ia: suggestedRoles,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`🎯 Você tem perfil ideal para: ${suggestedRoles.join(", ")}`);
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-navy">Complete seu perfil</h1>
          <p className="text-muted-foreground">
            Vamos conhecer você melhor para encontrar as melhores oportunidades
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idade">Idade *</Label>
            <Input
              id="idade"
              type="number"
              placeholder="Ex: 25"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="h-12"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro/Zona *</Label>
            <Input
              id="bairro"
              type="text"
              placeholder="Ex: São Gonçalo do Amarante"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="h-12"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escolaridade">Escolaridade *</Label>
            <Select value={escolaridade} onValueChange={setEscolaridade} disabled={loading}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                <SelectItem value="medio">Ensino Médio</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="superior">Ensino Superior</SelectItem>
                <SelectItem value="pos">Pós-graduação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencia">Experiência profissional *</Label>
            <Select value={experiencia} onValueChange={setExperiencia} disabled={loading}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem experiência</SelectItem>
                <SelectItem value="1-2">1-2 anos</SelectItem>
                <SelectItem value="3-5">3-5 anos</SelectItem>
                <SelectItem value="5+">Mais de 5 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Áreas de interesse *</Label>
            <div className="grid grid-cols-2 gap-3">
              {interessesOptions.map((interesse) => (
                <div
                  key={interesse}
                  className="flex items-center space-x-2 bg-card p-3 rounded-lg border"
                >
                  <Checkbox
                    id={interesse}
                    checked={interesses.includes(interesse)}
                    onCheckedChange={() => toggleInteresse(interesse)}
                    disabled={loading}
                  />
                  <label
                    htmlFor={interesse}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {interesse}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Recursos disponíveis</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 bg-card p-3 rounded-lg border">
                <Checkbox
                  id="internet"
                  checked={temInternet}
                  onCheckedChange={(checked) => setTemInternet(checked as boolean)}
                  disabled={loading}
                />
                <label htmlFor="internet" className="text-sm font-medium cursor-pointer">
                  Acesso à internet
                </label>
              </div>
              <div className="flex items-center space-x-2 bg-card p-3 rounded-lg border">
                <Checkbox
                  id="transporte"
                  checked={temTransporte}
                  onCheckedChange={(checked) => setTemTransporte(checked as boolean)}
                  disabled={loading}
                />
                <label htmlFor="transporte" className="text-sm font-medium cursor-pointer">
                  Transporte próprio
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="horarios">Horários disponíveis</Label>
            <Input
              id="horarios"
              type="text"
              placeholder="Ex: Manhã e tarde"
              value={horariosDisponiveis}
              onChange={(e) => setHorariosDisponiveis(e.target.value)}
              className="h-12"
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "Salvando..." : "Finalizar cadastro"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
