
import { Layout } from '@/components/Layout';

const Analises = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-muted-foreground">
            Visualize dados e tendências do seu negócio.
          </p>
        </div>
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Relatórios Analíticos</h2>
          <p className="text-muted-foreground">
            Conteúdo em desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Analises;
