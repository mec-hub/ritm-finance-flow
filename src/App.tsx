
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Financas from "./pages/Financas";
import Eventos from "./pages/Eventos";
import Clientes from "./pages/Clientes";
import Analises from "./pages/Analises";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NovaTransacao from "./pages/NovaTransacao";
import EditarTransacao from "./pages/EditarTransacao";
import DetalhesTransacao from "./pages/DetalhesTransacao";
import NovoEvento from "./pages/NovoEvento";
import EditarEvento from "./pages/EditarEvento";
import NovoCliente from "./pages/NovoCliente";
import EditarCliente from "./pages/EditarCliente";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Authentication route */}
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
      
      {/* Redirect root to auth if not authenticated, dashboard if authenticated */}
      <Route path="/" element={!user ? <Navigate to="/auth" /> : <Navigate to="/dashboard" />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/financas" element={<ProtectedRoute><Financas /></ProtectedRoute>} />
      <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
      <Route path="/analises" element={<ProtectedRoute><Analises /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
      
      {/* Transaction routes */}
      <Route path="/financas/nova" element={<ProtectedRoute><NovaTransacao /></ProtectedRoute>} />
      <Route path="/financas/editar/:id" element={<ProtectedRoute><EditarTransacao /></ProtectedRoute>} />
      <Route path="/financas/detalhes/:id" element={<ProtectedRoute><DetalhesTransacao /></ProtectedRoute>} />
      
      {/* Event routes */}
      <Route path="/eventos/novo" element={<ProtectedRoute><NovoEvento /></ProtectedRoute>} />
      <Route path="/eventos/editar/:id" element={<ProtectedRoute><EditarEvento /></ProtectedRoute>} />
      
      {/* Client routes */}
      <Route path="/clientes/novo" element={<ProtectedRoute><NovoCliente /></ProtectedRoute>} />
      <Route path="/clientes/editar/:id" element={<ProtectedRoute><EditarCliente /></ProtectedRoute>} />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
