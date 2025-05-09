
import { Layout } from '@/components/Layout';

const Configuracoes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as preferências do seu sistema.
          </p>
        </div>
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Preferências do Sistema</h2>
          <p className="text-muted-foreground">
            Conteúdo em desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
