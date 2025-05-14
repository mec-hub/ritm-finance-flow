
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Clientes from '@/pages/Clientes';
import NovoCliente from '@/pages/NovoCliente';
import EditarCliente from '@/pages/EditarCliente';
import Eventos from '@/pages/Eventos';
import NovoEvento from '@/pages/NovoEvento';
import EditarEvento from '@/pages/EditarEvento';
import Financas from '@/pages/Financas';
import NovaTransacao from '@/pages/NovaTransacao';
import Analises from '@/pages/Analises';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/novo-cliente" element={<NovoCliente />} />
        <Route path="/editar-cliente/:id" element={<EditarCliente />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/novo-evento" element={<NovoEvento />} />
        <Route path="/editar-evento/:id" element={<EditarEvento />} />
        <Route path="/financas" element={<Financas />} />
        <Route path="/nova-transacao" element={<NovaTransacao />} />
        <Route path="/analises" element={<Analises />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/index" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
