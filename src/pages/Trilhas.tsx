import { Search, SlidersHorizontal, Play } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const Trilhas = () => {
  const [activeTab, setActiveTab] = useState<"todos" | "popular" | "minhas">("todos");

  const trilhasRecomendadas = [
    {
      id: 1,
      title: "Operações Portuárias e Logística",
      color: "bg-gradient-to-br from-teal to-teal/80",
      image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Tecnologia para Ambiente Portuário",
      color: "bg-gradient-to-br from-yellow to-yellow/80",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop"
    }
  ];

  const outrasTrilhas = [
    {
      id: 3,
      title: "Meio Ambiente e Sustentabilidade",
      lessons: 24,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Gestão Industrial",
      lessons: 18,
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Trilhas" />
      
      <div className="px-4 py-4 space-y-6">
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

        {/* Section Title */}
        <div>
          <h2 className="text-xl font-bold text-navy mb-1">Escolha a trilha</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "todos" ? "default" : "outline"}
            onClick={() => setActiveTab("todos")}
            className="rounded-full"
          >
            Todos
          </Button>
          <Button
            variant={activeTab === "popular" ? "default" : "outline"}
            onClick={() => setActiveTab("popular")}
            className="rounded-full"
          >
            Popular
          </Button>
          <Button
            variant={activeTab === "minhas" ? "default" : "outline"}
            onClick={() => setActiveTab("minhas")}
            className="rounded-full"
          >
            Minhas trilhas
          </Button>
        </div>

        {/* Recommended Trails */}
        <div>
          <h3 className="text-lg font-bold text-navy mb-3">Trilhas recomendadas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Com base no seu perfil, competências e candidaturas.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {trilhasRecomendadas.map((trilha) => (
              <Card key={trilha.id} className={`${trilha.color} p-4 text-white relative overflow-hidden`}>
                <div className="relative z-10 space-y-3">
                  <h4 className="font-bold text-lg leading-tight">
                    {trilha.title}
                  </h4>
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                    Iniciar trilha
                  </Button>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
                  <img src={trilha.image} alt="" className="w-full h-full object-contain" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Other Trails */}
        <div>
          <h3 className="text-lg font-bold text-navy mb-4">Outras trilhas</h3>
          
          <div className="space-y-3">
            {outrasTrilhas.map((trilha) => (
              <Card key={trilha.id} className="flex items-center gap-3 p-3">
                <img
                  src={trilha.image}
                  alt={trilha.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-navy mb-1">{trilha.title}</h4>
                  <p className="text-sm text-primary">{trilha.lessons} aulas</p>
                </div>
                <Button size="icon" className="rounded-full bg-yellow hover:bg-yellow/90 h-12 w-12">
                  <Play className="h-5 w-5 fill-current" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Trilhas;

