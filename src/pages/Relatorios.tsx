
import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportExporter } from '@/components/reports/ReportExporter';
import { TransactionsOverview } from '@/components/reports/TransactionsOverview';
import { TransactionService } from '@/services/transactionService';
import { ClientService } from '@/services/clientService';
import { Transaction } from '@/types';
import { FileText, BarChart3, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([]);
  
  const [filters, setFilters] = useState<any>({
    type: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    category: undefined,
    clientId: undefined
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, clientsData] = await Promise.all([
        TransactionService.getAll(),
        ClientService.getAll()
      ]);
      
      setAllTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      
      // Extract unique categories
      const categories = Array.from(new Set(transactionsData.map(t => t.category)));
      setAvailableCategories(categories);
      
      // Format clients for filters
      const clients = clientsData.map(c => ({ id: c.id, name: c.name }));
      setAvailableClients(clients);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados para os relatórios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilters = (newFilters: any) => {
    let filtered = [...allTransactions];
    
    if (newFilters.type && newFilters.type !== 'all') {
      filtered = filtered.filter(t => t.type === newFilters.type);
    }
    
    if (newFilters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= newFilters.dateFrom!);
    }
    
    if (newFilters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= newFilters.dateTo!);
    }
    
    if (newFilters.category) {
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(newFilters.category.toLowerCase())
      );
    }
    
    if (newFilters.clientId) {
      filtered = filtered.filter(t => t.clientId === newFilters.clientId);
    }
    
    setFilteredTransactions(filtered);
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      category: undefined,
      clientId: undefined
    };
    applyFilters(clearedFilters);
  };

  const summaryMetrics = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados dos relatórios...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-500" />
              Relatórios
            </h1>
            <p className="text-muted-foreground">
              Gere relatórios detalhados de transações e clientes em PDF ou Excel.
            </p>
          </div>
        </div>

        {/* Filters */}
        <ReportFilters
          filters={filters}
          onFiltersChange={applyFilters}
          onClearFilters={clearFilters}
          availableCategories={availableCategories}
          availableClients={availableClients}
        />

        {/* Main Content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <TransactionsOverview transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <ReportExporter 
              transactions={filteredTransactions} 
              filters={filters}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
