
import { Layout } from '@/components/Layout';

const Relatorios = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios financeiros e operacionais.
          </p>
        </div>
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Relatórios Disponíveis</h2>
          <p className="text-muted-foreground">
            Conteúdo em desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
