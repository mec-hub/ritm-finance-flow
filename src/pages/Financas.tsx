
import { Layout } from '@/components/Layout';

const Financas = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finanças</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas.
          </p>
        </div>
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Visão Financeira</h2>
          <p className="text-muted-foreground">
            Conteúdo em desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Financas;
