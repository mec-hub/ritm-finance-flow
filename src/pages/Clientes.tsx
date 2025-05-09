
import { Layout } from '@/components/Layout';

const Clientes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus contatos e histórico de clientes.
          </p>
        </div>
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Lista de Clientes</h2>
          <p className="text-muted-foreground">
            Conteúdo em desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
