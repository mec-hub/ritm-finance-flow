
import { Layout } from '@/components/Layout';

const Eventos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie seus shows e apresentações.
          </p>
        </div>
        
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Próximos Eventos</h2>
          <p className="text-muted-foreground">
            Conteúdo em desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Eventos;
