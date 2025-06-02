
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TransactionProvider } from "@/contexts/TransactionContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Financas from "./pages/Financas";
import NovaTransacao from "./pages/NovaTransacao";
import EditarTransacao from "./pages/EditarTransacao";
import DetalhesTransacao from "./pages/DetalhesTransacao";
import Eventos from "./pages/Eventos";
import NovoEvento from "./pages/NovoEvento";
import EditarEvento from "./pages/EditarEvento";
import Clientes from "./pages/Clientes";
import NovoCliente from "./pages/NovoCliente";
import EditarCliente from "./pages/EditarCliente";
import Analises from "./pages/Analises";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SidebarProvider>
      <TransactionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/financas" element={<Financas />} />
              <Route path="/nova-transacao" element={<NovaTransacao />} />
              <Route path="/editar-transacao/:id" element={<EditarTransacao />} />
              <Route path="/detalhes-transacao/:id" element={<DetalhesTransacao />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/novo-evento" element={<NovoEvento />} />
              <Route path="/editar-evento/:id" element={<EditarEvento />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/novo-cliente" element={<NovoCliente />} />
              <Route path="/editar-cliente/:id" element={<EditarCliente />} />
              <Route path="/analises" element={<Analises />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TransactionProvider>
    </SidebarProvider>
  </QueryClientProvider>
);

export default App;
