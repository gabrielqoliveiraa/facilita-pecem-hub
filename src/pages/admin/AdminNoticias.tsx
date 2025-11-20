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

interface Noticia {
  id: string;
  title: string;
  description: string;
  content: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
}

interface NoticiaForm {
  title: string;
  description: string;
  content: string;
  image_url: string;
  is_published: boolean;
}

const AdminNoticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<NoticiaForm>();

  const fetchNoticias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar notícias",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNoticias(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const onSubmit = async (data: NoticiaForm) => {
    if (editingNoticia) {
      const { error } = await supabase
        .from("noticias")
        .update(data)
        .eq("id", editingNoticia.id);

      if (error) {
        toast({
          title: "Erro ao atualizar notícia",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Notícia atualizada com sucesso!" });
        fetchNoticias();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase.from("noticias").insert([data]);

      if (error) {
        toast({
          title: "Erro ao criar notícia",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Notícia criada com sucesso!" });
        fetchNoticias();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;

    const { error } = await supabase.from("noticias").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir notícia",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Notícia excluída com sucesso!" });
      fetchNoticias();
    }
  };

  const handleEdit = (noticia: Noticia) => {
    setEditingNoticia(noticia);
    setValue("title", noticia.title);
    setValue("description", noticia.description);
    setValue("content", noticia.content || "");
    setValue("image_url", noticia.image_url || "");
    setValue("is_published", noticia.is_published);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingNoticia(null);
    reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notícias</h1>
            <p className="text-muted-foreground">Gerencie as notícias e comunicados</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => reset()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Notícia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNoticia ? "Editar Notícia" : "Nova Notícia"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" {...register("title", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    {...register("description", { required: true })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Conteúdo Completo</Label>
                  <Textarea id="content" {...register("content")} rows={6} />
                </div>
                <div>
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input id="image_url" {...register("image_url")} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_published" {...register("is_published")} defaultChecked />
                  <Label htmlFor="is_published">Publicada</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingNoticia ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Notícias</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Publicada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noticias.map((noticia) => (
                    <TableRow key={noticia.id}>
                      <TableCell className="font-medium">{noticia.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {noticia.description}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            noticia.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {noticia.is_published ? "Publicada" : "Rascunho"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(noticia.published_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(noticia)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(noticia.id)}
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

export default AdminNoticias;
