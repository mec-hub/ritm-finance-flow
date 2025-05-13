
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Financas from "./pages/Financas";
import Eventos from "./pages/Eventos";
import Clientes from "./pages/Clientes";
import Analises from "./pages/Analises";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NovaTransacao from "./pages/NovaTransacao";
import NovoCliente from "./pages/NovoCliente";
import NovoEvento from "./pages/NovoEvento";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/financas" element={<Financas />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/analises" element={<Analises />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/nova-transacao" element={<NovaTransacao />} />
            <Route path="/novo-cliente" element={<NovoCliente />} />
            <Route path="/novo-evento" element={<NovoEvento />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);

export default App;
