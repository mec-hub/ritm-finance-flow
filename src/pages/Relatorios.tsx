
import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdvancedReportFilters } from '@/components/reports/AdvancedReportFilters';
import { ReportTemplateSelector } from '@/components/reports/ReportTemplateSelector';
import { TransactionService } from '@/services/transactionService';
import { ReportService, ReportFilters } from '@/services/reportService';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { FileText, TrendingUp, BarChart3, PieChart, Construction } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const [filters, setFilters] = useState<ReportFilters>({
    type: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    category: undefined,
    eventId: undefined,
    clientId: undefined
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const transactionsData = await TransactionService.getAll();
      setAllTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
    fetchTransactions();
  }, []);

  const applyFilters = (newFilters: ReportFilters) => {
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
        t.category.toLowerCase().includes(newFilters.category!.toLowerCase())
      );
    }
    
    if (newFilters.eventId) {
      filtered = filtered.filter(t => t.eventId === newFilters.eventId);
    }
    
    if (newFilters.clientId) {
      filtered = filtered.filter(t => t.clientId === newFilters.clientId);
    }
    
    setFilteredTransactions(filtered);
    setFilters(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ReportFilters = {
      type: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      category: undefined,
      eventId: undefined,
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
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      transactionCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const availableCategories = useMemo(() => 
    Array.from(new Set(allTransactions.map(t => t.category))), 
    [allTransactions]
  );

  const generatePDFReport = async (templateId: string) => {
    toast({
      title: "Em Desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

  const generateExcelReport = async (templateId: string) => {
    toast({
      title: "Em Desenvolvimento", 
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };

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
              <Construction className="h-8 w-8 text-orange-500" />
              Relatórios (Em Desenvolvimento)
            </h1>
            <p className="text-muted-foreground">
              Esta seção está sendo desenvolvida. Métricas básicas estão disponíveis.
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Construction className="h-3 w-3" />
            Beta
          </Badge>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(summaryMetrics.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.type === 'income').length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(summaryMetrics.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.type === 'expense').length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <BarChart3 className={`h-4 w-4 ${
                summaryMetrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                summaryMetrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatCurrency(summaryMetrics.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margem: {summaryMetrics.profitMargin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <PieChart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryMetrics.transactionCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {availableCategories.length} categorias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <AdvancedReportFilters
          filters={filters}
          onFiltersChange={applyFilters}
          onClearFilters={clearFilters}
          availableCategories={availableCategories}
          availableEvents={[]}
          availableClients={[]}
        />

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatórios Detalhados
            </CardTitle>
            <CardDescription>
              Funcionalidades avançadas de relatórios em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportTemplateSelector
              templates={[]}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onGeneratePDF={generatePDFReport}
              onGenerateExcel={generateExcelReport}
              isGenerating={false}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;
