import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/AuthCallback";
import Comunidade from "./pages/Comunidade";
import Trilhas from "./pages/Trilhas";
import MinhasTrilhas from "./pages/MinhasTrilhas";
import Rotas from "./pages/Rotas";
import Vagas from "./pages/Vagas";
import MeuCurriculo from "./pages/MeuCurriculo";
import Competencias from "./pages/Competencias";
import MinhasVagas from "./pages/MinhasVagas";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Comunidade />} />
          <Route path="/trilhas" element={<Trilhas />} />
          <Route path="/minhas-trilhas" element={<MinhasTrilhas />} />
          <Route path="/rotas" element={<Rotas />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/meu-curriculo" element={<MeuCurriculo />} />
          <Route path="/competencias" element={<Competencias />} />
          <Route path="/minhas-vagas" element={<MinhasVagas />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
