import { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Download, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CurriculoData {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

const MeuCurriculo = () => {
  const [curriculo, setCurriculo] = useState<CurriculoData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurriculo();
  }, []);

  const loadCurriculo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("curriculos")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      setCurriculo(data);
    } catch (error) {
      console.error("Erro ao carregar currículo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu currículo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação do arquivo
    if (file.type !== "application/pdf") {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos PDF",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Delete old curriculum if exists
      if (curriculo) {
        await supabase.storage
          .from("curriculos")
          .remove([curriculo.file_path]);
        
        await supabase
          .from("curriculos")
          .delete()
          .eq("id", curriculo.id);
      }

      // Upload new file
      const fileExt = "pdf";
      const fileName = `${user.id}/curriculo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("curriculos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save metadata
      const { data: newCurriculo, error: dbError } = await supabase
        .from("curriculos")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setCurriculo(newCurriculo);
      
      toast({
        title: "Sucesso!",
        description: "Currículo enviado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o currículo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!curriculo) return;

    try {
      const { data, error } = await supabase.storage
        .from("curriculos")
        .download(curriculo.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = curriculo.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o currículo",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!curriculo) return;

    try {
      await supabase.storage
        .from("curriculos")
        .remove([curriculo.file_path]);
      
      await supabase
        .from("curriculos")
        .delete()
        .eq("id", curriculo.id);

      setCurriculo(null);
      setInsights(null);
      
      toast({
        title: "Sucesso!",
        description: "Currículo removido com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o currículo",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!curriculo) return;

    setAnalyzing(true);
    setInsights(null);

    try {
      const { data, error } = await supabase.functions.invoke("analisar-curriculo", {
        body: { filePath: curriculo.file_path },
      });

      if (error) throw error;

      setInsights(data.insights);
      
      toast({
        title: "Análise concluída!",
        description: "Confira os insights abaixo",
      });
    } catch (error) {
      console.error("Erro ao analisar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível analisar o currículo",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Meu currículo" />
        <div className="px-4 py-6 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Meu currículo" />
      
      <div className="px-4 py-6 space-y-6">
        {/* Upload Area */}
        {!curriculo ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Envie seu currículo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Arquivo PDF de até 5MB
                </p>
              </div>

              <label htmlFor="file-upload">
                <Button
                  disabled={uploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    {uploading ? "Enviando..." : "Escolher arquivo"}
                  </span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">
                  {curriculo.file_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{formatFileSize(curriculo.file_size)}</span>
                  <span>•</span>
                  <span>Enviado em {formatDate(curriculo.uploaded_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 rounded-md">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
                <Sparkles className={`h-4 w-4 mr-2 ${analyzing ? 'opacity-0' : ''}`} />
                <span className={analyzing ? 'opacity-0' : ''}>
                  {analyzing ? "Analisando..." : "Analisar Currículo"}
                </span>
              </Button>

              <label htmlFor="file-replace">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Enviando..." : "Enviar novo currículo"}
                  </span>
                </Button>
                <input
                  id="file-replace"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </Card>
        )}

        {/* AI Insights Section */}
        {insights && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="font-bold text-foreground">Insights da Análise</h4>
            </div>
            <div className="text-sm text-foreground/90 whitespace-pre-line space-y-1">
              {insights}
            </div>
          </Card>
        )}

        {/* Info Section */}
        <Card className="p-6 bg-secondary/50">
          <h4 className="font-bold text-foreground mb-3">
            Dicas para um bom currículo
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Mantenha seu currículo atualizado</li>
            <li>• Destaque suas principais experiências</li>
            <li>• Seja claro e objetivo</li>
            <li>• Revise para evitar erros de ortografia</li>
            <li>• Use um formato profissional e organizado</li>
          </ul>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default MeuCurriculo;
