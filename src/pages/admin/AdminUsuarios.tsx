import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserWithRole {
  id: string;
  nome: string;
  role: string | null;
}

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsuarios = async () => {
    try {
      // Buscar todos os perfis
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome");

      if (!profiles) return;

      // Buscar roles de todos os usuários
      const userIds = profiles.map(p => p.id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Combinar dados
      const usersWithRoles = profiles.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          nome: profile.nome,
          role: userRole?.role || null
        };
      });

      setUsuarios(usersWithRoles);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleAddAdmin = async () => {
    try {
      // Buscar o user_id pelo email no auth.users não é possível via client
      // Então vamos buscar pelo profiles usando o email cadastrado
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .limit(1)
        .single();

      if (!profile) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Para adicionar role, use o email de um usuário já cadastrado no sistema.",
        });
        return;
      }

      // Na prática, vamos permitir adicionar role ao próprio usuário logado para teste
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: selectedRole as "admin" | "moderator" | "user"
        });

      if (error) throw error;

      toast({
        title: "Role adicionada com sucesso",
        description: `Role ${selectedRole} adicionada.`,
      });

      setDialogOpen(false);
      setEmail("");
      fetchUsuarios();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar role",
        description: error.message,
      });
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Role removida com sucesso",
      });

      fetchUsuarios();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover role",
        description: error.message,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Controle de permissões e roles</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Role ao seu usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Role</DialogTitle>
                <DialogDescription>
                  Adicione uma role de permissão ao seu usuário logado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderador</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAdmin} className="w-full">
                  Adicionar Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Usuários cadastrados e suas permissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            <Shield className="mr-1 h-3 w-3" />
                            {user.role}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sem role</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRole(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como criar o primeiro Admin</CardTitle>
            <CardDescription>
              Para criar o primeiro administrador do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                1. Faça login no sistema com sua conta
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                2. Vá em <strong>Cloud {'>'} Database {'>'} Tables {'>'} user_roles</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                3. Clique em <strong>Insert Row</strong> e adicione:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-4">
                <li>user_id: Seu ID de usuário</li>
                <li>role: admin</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                4. Após isso, você poderá acessar o painel admin e gerenciar outros usuários por aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsuarios;
