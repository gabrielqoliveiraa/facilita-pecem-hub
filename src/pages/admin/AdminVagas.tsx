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

interface Vaga {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string | null;
  requirements: string | null;
  is_active: boolean;
  posted_at: string;
  expires_at: string | null;
}

interface VagaForm {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  is_active: boolean;
  expires_at: string;
}

const AdminVagas = () => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVaga, setEditingVaga] = useState<Vaga | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm<VagaForm>();

  const fetchVagas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vagas")
      .select("*")
      .order("posted_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar vagas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setVagas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVagas();
  }, []);

  const onSubmit = async (data: VagaForm) => {
    const vagaData = {
      ...data,
      expires_at: data.expires_at || null,
    };

    if (editingVaga) {
      const { error } = await supabase
        .from("vagas")
        .update(vagaData)
        .eq("id", editingVaga.id);

      if (error) {
        toast({
          title: "Erro ao atualizar vaga",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Vaga atualizada com sucesso!" });
        fetchVagas();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase.from("vagas").insert([vagaData]);

      if (error) {
        toast({
          title: "Erro ao criar vaga",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Vaga criada com sucesso!" });
        fetchVagas();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;

    const { error } = await supabase.from("vagas").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir vaga",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Vaga excluída com sucesso!" });
      fetchVagas();
    }
  };

  const handleEdit = (vaga: Vaga) => {
    setEditingVaga(vaga);
    setValue("title", vaga.title);
    setValue("company", vaga.company);
    setValue("location", vaga.location);
    setValue("type", vaga.type);
    setValue("salary", vaga.salary);
    setValue("description", vaga.description || "");
    setValue("requirements", vaga.requirements || "");
    setValue("is_active", vaga.is_active);
    setValue("expires_at", vaga.expires_at ? vaga.expires_at.split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVaga(null);
    reset();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vagas</h1>
            <p className="text-muted-foreground">Gerencie as oportunidades de emprego</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => reset()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVaga ? "Editar Vaga" : "Nova Vaga"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" {...register("title", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="company">Empresa *</Label>
                  <Input id="company" {...register("company", { required: true })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Localização *</Label>
                    <Input id="location" {...register("location", { required: true })} />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Input
                      id="type"
                      {...register("type", { required: true })}
                      placeholder="Ex: CLT, PJ, Estágio"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="salary">Salário *</Label>
                  <Input
                    id="salary"
                    {...register("salary", { required: true })}
                    placeholder="Ex: R$ 2.000 - R$ 3.000"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" {...register("description")} rows={4} />
                </div>
                <div>
                  <Label htmlFor="requirements">Requisitos</Label>
                  <Textarea id="requirements" {...register("requirements")} rows={4} />
                </div>
                <div>
                  <Label htmlFor="expires_at">Data de Expiração</Label>
                  <Input id="expires_at" type="date" {...register("expires_at")} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" {...register("is_active")} defaultChecked />
                  <Label htmlFor="is_active">Vaga Ativa</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVaga ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Vagas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vagas.map((vaga) => (
                    <TableRow key={vaga.id}>
                      <TableCell className="font-medium">{vaga.title}</TableCell>
                      <TableCell>{vaga.company}</TableCell>
                      <TableCell>{vaga.location}</TableCell>
                      <TableCell>{vaga.type}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            vaga.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vaga.is_active ? "Ativa" : "Inativa"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(vaga)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(vaga.id)}
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

export default AdminVagas;
