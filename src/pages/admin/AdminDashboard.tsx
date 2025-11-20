import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, GraduationCap, Newspaper, Users } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    vagas: 0,
    trilhas: 0,
    noticias: 0,
    usuarios: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [vagasCount, trilhasCount, noticiasCount, usuariosCount] = await Promise.all([
        supabase.from("vagas").select("*", { count: "exact", head: true }),
        supabase.from("trilhas").select("*", { count: "exact", head: true }),
        supabase.from("noticias").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        vagas: vagasCount.count || 0,
        trilhas: trilhasCount.count || 0,
        noticias: noticiasCount.count || 0,
        usuarios: usuariosCount.count || 0,
      });
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Vagas Ativas", value: stats.vagas, icon: Briefcase, color: "text-blue-600" },
    { title: "Trilhas", value: stats.trilhas, icon: GraduationCap, color: "text-green-600" },
    { title: "Notícias", value: stats.noticias, icon: Newspaper, color: "text-purple-600" },
    { title: "Usuários", value: stats.usuarios, icon: Users, color: "text-orange-600" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
