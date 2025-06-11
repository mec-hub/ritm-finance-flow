import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionsList } from '@/components/financas/TransactionsList';
import { BudgetManager } from '@/components/financas/BudgetManager';
import { FinancialSummary } from '@/components/financas/FinancialSummary';
import { RecurringTransactions } from '@/components/financas/RecurringTransactions';
import { TransactionFilters } from '@/components/financas/TransactionFilters';
import { TeamEarningsDashboard } from '@/components/financas/TeamEarningsDashboard';
import { Link } from 'react-router-dom';
import { Filter, PlusCircle } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { TransactionService } from '@/services/transactionService';
import { toast } from '@/hooks/use-toast';

const Financas = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    category: '',
    minAmount: '',
    maxAmount: '',
  });

  const fetchTransactions = async () => {
    try {
      console.log('Financas - Fetching transactions...');
      const transactionsData = await TransactionService.getAll();
      console.log('Financas - Transactions data:', transactionsData);
      setAllTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Calculate financial summary data using filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netProfit = totalIncome - totalExpenses;

  // Apply filters to transactions
  const applyFilters = (filterOptions: typeof filters) => {
    let filtered = [...allTransactions];
    
    if (filterOptions.type !== 'all') {
      filtered = filtered.filter(t => t.type === filterOptions.type);
    }
    
    if (filterOptions.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= filterOptions.dateFrom!);
    }
    
    if (filterOptions.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= filterOptions.dateTo!);
    }
    
    if (filterOptions.category) {
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(filterOptions.category.toLowerCase())
      );
    }
    
    if (filterOptions.minAmount) {
      const min = parseFloat(filterOptions.minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter(t => t.amount >= min);
      }
    }
    
    if (filterOptions.maxAmount) {
      const max = parseFloat(filterOptions.maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter(t => t.amount <= max);
      }
    }
    
    setFilteredTransactions(filtered);
    setFilters(filterOptions);
  };

  // Function to reset the filters to get all transactions
  const resetFilters = () => {
    applyFilters({
      type: 'all',
      dateFrom: null,
      dateTo: null,
      category: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const handleTransactionDeleted = () => {
    fetchTransactions();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando transações...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finanças</h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas e despesas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button asChild>
              <Link to="/financas/nova">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Transação
              </Link>
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <TransactionFilters 
            filters={filters} 
            onApplyFilters={applyFilters} 
            onClearFilters={resetFilters}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={netProfit >= 0 ? "border-green-500/50" : "border-red-500/50"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(netProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Diferença entre receitas e despesas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Soma de todas as receitas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Soma de todas as despesas
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="transactions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="summary">Resumo Financeiro</TabsTrigger>
            <TabsTrigger value="recurring">Transações Recorrentes</TabsTrigger>
            <TabsTrigger value="team">Ganhos da Equipe</TabsTrigger>
            <TabsTrigger value="budget">Orçamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <TransactionsList 
              filters={filters} 
            />
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <FinancialSummary transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            <RecurringTransactions transactions={filteredTransactions.filter(t => t.isRecurring)} />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <TeamEarningsDashboard />
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <BudgetManager transactions={filteredTransactions} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Financas;
