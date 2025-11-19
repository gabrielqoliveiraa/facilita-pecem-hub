import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const Rotas = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Rotas" />
      
      <div className="px-4 py-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-lavender rounded-full mx-auto flex items-center justify-center">
            <span className="text-4xl">🗺️</span>
          </div>
          <h2 className="text-2xl font-bold text-navy">Rotas em desenvolvimento</h2>
          <p className="text-muted-foreground">
            Em breve você terá acesso a informações sobre rotas e transporte para o Pecém.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Rotas;
