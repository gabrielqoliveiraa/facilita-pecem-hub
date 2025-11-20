import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface Trilha {
  id: string;
  title: string;
  description: string | null;
  lessons_count: number;
  is_recommended: boolean;
  is_active: boolean;
  image_url: string | null;
  color_class: string | null;
}

interface TrilhaForm {
  title: string;
  description: string;
  lessons_count: number;
  is_recommended: boolean;
  is_active: boolean;
  image_url: string;
  color_class: string;
}

const AdminTrilhas = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrilha, setEditingTrilha] = useState<Trilha | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<TrilhaForm>();

  const fetchTrilhas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trilhas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar trilhas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTrilhas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrilhas();
  }, []);

  const onSubmit = async (data: TrilhaForm) => {
    if (editingTrilha) {
      const { error } = await supabase
        .from("trilhas")
        .update(data)
        .eq("id", editingTrilha.id);

      if (error) {
        toast({
          title: "Erro ao atualizar trilha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Trilha atualizada com sucesso!" });
        fetchTrilhas();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase.from("trilhas").insert([data]);

      if (error) {
        toast({
          title: "Erro ao criar trilha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Trilha criada com sucesso!" });
        fetchTrilhas();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta trilha?")) return;

    const { error } = await supabase.from("trilhas").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir trilha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Trilha excluída com sucesso!" });
      fetchTrilhas();
    }
  };

  const handleEdit = (trilha: Trilha) => {
    setEditingTrilha(trilha);
    setValue("title", trilha.title);
    setValue("description", trilha.description || "");
    setValue("lessons_count", trilha.lessons_count);
    setValue("is_recommended", trilha.is_recommended);
    setValue("is_active", trilha.is_active);
    setValue("image_url", trilha.image_url || "");
    setValue("color_class", trilha.color_class || "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTrilha(null);
    reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trilhas</h1>
            <p className="text-muted-foreground">Gerencie as trilhas de aprendizado</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => reset()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Trilha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTrilha ? "Editar Trilha" : "Nova Trilha"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" {...register("title", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" {...register("description")} />
                </div>
                <div>
                  <Label htmlFor="lessons_count">Número de Aulas</Label>
                  <Input
                    id="lessons_count"
                    type="number"
                    {...register("lessons_count", { valueAsNumber: true })}
                    defaultValue={0}
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input id="image_url" {...register("image_url")} />
                </div>
                <div>
                  <Label htmlFor="color_class">Classe de Cor (Tailwind)</Label>
                  <Input
                    id="color_class"
                    {...register("color_class")}
                    placeholder="Ex: bg-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_recommended" {...register("is_recommended")} />
                  <Label htmlFor="is_recommended">Recomendada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" {...register("is_active")} defaultChecked />
                  <Label htmlFor="is_active">Ativa</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTrilha ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Trilhas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Aulas</TableHead>
                    <TableHead>Recomendada</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trilhas.map((trilha) => (
                    <TableRow key={trilha.id}>
                      <TableCell className="font-medium">{trilha.title}</TableCell>
                      <TableCell>{trilha.lessons_count}</TableCell>
                      <TableCell>{trilha.is_recommended ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            trilha.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {trilha.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(trilha)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(trilha.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTrilhas;
