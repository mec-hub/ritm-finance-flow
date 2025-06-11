
import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedReportFilters } from '@/components/reports/AdvancedReportFilters';
import { ReportTemplateSelector } from '@/components/reports/ReportTemplateSelector';
import { InteractiveDashboard } from '@/components/reports/InteractiveDashboard';
import { TransactionService } from '@/services/transactionService';
import { ReportService, ReportFilters } from '@/services/reportService';
import { Transaction, Event, Client } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { FileText, TrendingUp, BarChart3, PieChart, Download, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  const [filters, setFilters] = useState<ReportFilters>({
    type: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    category: undefined,
    eventId: undefined,
    clientId: undefined
  });

  // Mock data for events and clients - replace with actual service calls
  const mockEvents: Event[] = [];
  const mockClients: Client[] = [];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Relatorios - Fetching transactions...');
      const transactionsData = await TransactionService.getAll();
      console.log('Relatorios - Transactions data:', transactionsData);
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

  // Apply filters to transactions
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

  // Calculate summary metrics
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

  // Get available filter options
  const availableCategories = useMemo(() => 
    Array.from(new Set(allTransactions.map(t => t.category))), 
    [allTransactions]
  );

  const availableEvents = useMemo(() => 
    mockEvents.map(e => ({ id: e.id, title: e.title })), 
    [mockEvents]
  );

  const availableClients = useMemo(() => 
    mockClients.map(c => ({ id: c.id, name: c.name })), 
    [mockClients]
  );

  // Report generation functions
  const generatePDFReport = async (templateId: string) => {
    try {
      setIsGenerating(true);
      
      const reportData = prepareReportData(templateId);
      ReportService.generatePDFReport(getReportType(templateId), reportData, filters);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório PDF foi baixado com sucesso."
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcelReport = async (templateId: string) => {
    try {
      setIsGenerating(true);
      
      const reportData = prepareReportData(templateId);
      ReportService.generateExcelReport(getReportType(templateId), reportData, filters);
      
      toast({
        title: "Relatório gerado",
        description: "O relatório Excel foi baixado com sucesso."
      });
    } catch (error) {
      console.error('Error generating Excel report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório Excel.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const prepareReportData = (templateId: string) => {
    const reportType = getReportType(templateId);
    
    switch (reportType) {
      case 'financial':
        return {
          transactions: filteredTransactions,
          summary: summaryMetrics
        };
      case 'client':
        return {
          clients: mockClients,
          totalRevenue: summaryMetrics.totalIncome
        };
      case 'event':
        return {
          events: mockEvents,
          summary: summaryMetrics
        };
      case 'tax':
        const categorizedExpenses = filteredTransactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {} as { [key: string]: number });
        
        return {
          categorizedExpenses,
          totalDeductible: summaryMetrics.totalExpenses,
          transactions: filteredTransactions.filter(t => t.type === 'expense')
        };
      case 'team':
        return {
          teamMembers: [], // Add team data when available
          totalPaid: 0
        };
      default:
        return { transactions: filteredTransactions, summary: summaryMetrics };
    }
  };

  const getReportType = (templateId: string): string => {
    if (templateId.includes('financial')) return 'financial';
    if (templateId.includes('client')) return 'client';
    if (templateId.includes('event')) return 'event';
    if (templateId.includes('tax')) return 'tax';
    if (templateId.includes('team')) return 'team';
    return 'financial';
  };

  const handleDrillDown = (type: string, filter: any) => {
    // Apply drill-down filters
    const newFilters = { ...filters, ...filter };
    applyFilters(newFilters);
    
    // Switch to appropriate tab
    if (type === 'profit' || type === 'income' || type === 'expenses') {
      setActiveTab('financial');
    } else if (type === 'events') {
      setActiveTab('events');
    } else if (type === 'client') {
      setActiveTab('clients');
    }
    
    toast({
      title: "Filtro aplicado",
      description: `Visualizando dados filtrados por ${type}.`
    });
  };

  const handleExportSegment = (data: any, type: string) => {
    // Export specific data segment
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dados exportados",
      description: `Os dados de ${type} foram exportados com sucesso.`
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
            <h1 className="text-3xl font-bold tracking-tight">Relatórios Avançados</h1>
            <p className="text-muted-foreground">
              Dashboard interativo com relatórios profissionais e análises detalhadas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Object.values(filters).some(v => v !== undefined && v !== 'all' && v !== '') && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Filtros ativos
              </Badge>
            )}
          </div>
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
          availableEvents={availableEvents}
          availableClients={availableClients}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard Interativo</TabsTrigger>
            <TabsTrigger value="financial">Relatórios Financeiros</TabsTrigger>
            <TabsTrigger value="events">Relatórios de Eventos</TabsTrigger>
            <TabsTrigger value="clients">Relatórios de Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <InteractiveDashboard
              transactions={filteredTransactions}
              events={mockEvents}
              clients={mockClients}
              onDrillDown={handleDrillDown}
              onExportSegment={handleExportSegment}
            />
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <ReportTemplateSelector
              templates={ReportService.getReportTemplates().filter(t => t.type === 'financial')}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onGeneratePDF={generatePDFReport}
              onGenerateExcel={generateExcelReport}
              isGenerating={isGenerating}
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <ReportTemplateSelector
              templates={ReportService.getReportTemplates().filter(t => t.type === 'events')}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onGeneratePDF={generatePDFReport}
              onGenerateExcel={generateExcelReport}
              isGenerating={isGenerating}
            />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <ReportTemplateSelector
              templates={ReportService.getReportTemplates().filter(t => t.type === 'clients')}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onGeneratePDF={generatePDFReport}
              onGenerateExcel={generateExcelReport}
              isGenerating={isGenerating}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
