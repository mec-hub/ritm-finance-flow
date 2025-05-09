
import { Transaction, Event, Client, TeamMember, MonthlyData, CategoryData, DashboardStats } from '@/types';

// Helper to create date objects for the past n days
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper to create date objects for the future n days
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 5000,
    description: 'Show em Concha Acústica',
    date: daysAgo(2),
    category: 'Shows',
    subcategory: 'Público',
    isRecurring: false,
    type: 'income',
    clientId: '1',
    eventId: '1',
    notes: 'Evento com grande público'
  },
  {
    id: '2',
    amount: 3500,
    description: 'Evento Privado no Palco Toca Raul',
    date: daysAgo(7),
    category: 'Shows',
    subcategory: 'Privado',
    isRecurring: false,
    type: 'income',
    clientId: '2',
    eventId: '2',
    notes: 'Cliente VIP'
  },
  {
    id: '3',
    amount: 4200,
    description: 'Sunset session no Baía Sunset',
    date: daysAgo(12),
    category: 'Shows',
    subcategory: 'Sunset',
    isRecurring: false,
    type: 'income',
    clientId: '3',
    eventId: '3'
  },
  {
    id: '4',
    amount: 800,
    description: 'Transporte para Concha Acústica',
    date: daysAgo(2),
    category: 'Transporte',
    subcategory: 'Combustível',
    isRecurring: false,
    type: 'expense',
    eventId: '1'
  },
  {
    id: '5',
    amount: 1200,
    description: 'Manutenção equipamento Pioneer',
    date: daysAgo(15),
    category: 'Equipamento',
    subcategory: 'Manutenção',
    isRecurring: false,
    type: 'expense'
  },
  {
    id: '6',
    amount: 450,
    description: 'Alimentação equipe',
    date: daysAgo(7),
    category: 'Alimentação',
    isRecurring: false,
    type: 'expense',
    eventId: '2',
    teamMemberId: '1'
  },
  {
    id: '7',
    amount: 2500,
    description: 'Pagamento Assistente',
    date: daysAgo(1),
    category: 'Equipe',
    subcategory: 'Salários',
    isRecurring: true,
    recurrenceInterval: 'monthly',
    type: 'expense',
    teamMemberId: '2'
  },
  {
    id: '8',
    amount: 1000,
    description: 'Campanha Instagram',
    date: daysAgo(5),
    category: 'Marketing',
    subcategory: 'Mídias Sociais',
    isRecurring: false,
    type: 'expense'
  },
  {
    id: '9',
    amount: 3000,
    description: 'Festival de Verão',
    date: daysFromNow(10),
    category: 'Shows',
    subcategory: 'Festival',
    isRecurring: false,
    type: 'income',
    clientId: '4',
    eventId: '4',
    notes: 'Adiantamento 50%'
  },
  {
    id: '10',
    amount: 600,
    description: 'Hospedagem para evento',
    date: daysFromNow(9),
    category: 'Hospedagem',
    isRecurring: false,
    type: 'expense',
    eventId: '4'
  }
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Show em Concha Acústica',
    date: daysAgo(2),
    location: 'Salvador, BA',
    client: 'Prefeitura de Salvador',
    estimatedRevenue: 5000,
    actualRevenue: 5000,
    estimatedExpenses: 800,
    actualExpenses: 800,
    status: 'completed',
    notes: 'Evento bem sucedido'
  },
  {
    id: '2',
    title: 'Evento Privado no Palco Toca Raul',
    date: daysAgo(7),
    location: 'Salvador, BA',
    client: 'Empresa XYZ',
    estimatedRevenue: 3500,
    actualRevenue: 3500,
    estimatedExpenses: 450,
    actualExpenses: 450,
    status: 'completed'
  },
  {
    id: '3',
    title: 'Sunset session no Baía Sunset',
    date: daysAgo(12),
    location: 'Salvador, BA',
    client: 'Baía Sunset Bar',
    estimatedRevenue: 4000,
    actualRevenue: 4200,
    estimatedExpenses: 300,
    actualExpenses: 300,
    status: 'completed',
    notes: 'Recebido bônus por alta audiência'
  },
  {
    id: '4',
    title: 'Festival de Verão',
    date: daysFromNow(10),
    location: 'Praia do Forte, BA',
    client: 'Festival de Verão Produções',
    estimatedRevenue: 6000,
    estimatedExpenses: 1200,
    status: 'upcoming',
    notes: 'Adiantamento 50% recebido'
  },
  {
    id: '5',
    title: 'Casamento Família Silva',
    date: daysFromNow(25),
    location: 'Salvador, BA',
    client: 'Família Silva',
    estimatedRevenue: 3800,
    estimatedExpenses: 600,
    status: 'upcoming'
  }
];

// Mock Clients
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Prefeitura de Salvador',
    contact: 'Maria Coordenadora',
    email: 'eventos@salvador.ba.gov.br',
    totalRevenue: 12000,
    lastEvent: daysAgo(2),
    notes: 'Cliente regular para eventos municipais'
  },
  {
    id: '2',
    name: 'Empresa XYZ',
    contact: 'João Gerente',
    email: 'joao@xyz.com.br',
    totalRevenue: 8500,
    lastEvent: daysAgo(7),
    notes: 'Preferência para eventos corporativos'
  },
  {
    id: '3',
    name: 'Baía Sunset Bar',
    contact: 'Carlos Proprietário',
    email: 'carlos@baiasunset.com',
    totalRevenue: 15000,
    lastEvent: daysAgo(12),
    notes: 'Contrato mensal para sunset sessions'
  },
  {
    id: '4',
    name: 'Festival de Verão Produções',
    contact: 'Paula Produtora',
    email: 'paula@festivalverao.com.br',
    totalRevenue: 6000,
    notes: 'Novo cliente com grande potencial'
  },
  {
    id: '5',
    name: 'Família Silva',
    contact: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    totalRevenue: 3800,
    notes: 'Casamento da filha'
  }
];

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'DJ Davizão',
    role: 'DJ Principal',
    percentageShare: 60,
    totalPaid: 15000,
    pendingAmount: 2000
  },
  {
    id: '2',
    name: 'Ana',
    role: 'Assistente',
    percentageShare: 20,
    totalPaid: 5000,
    pendingAmount: 0
  },
  {
    id: '3',
    name: 'Pedro',
    role: 'Técnico de Som',
    percentageShare: 10,
    totalPaid: 2500,
    pendingAmount: 500
  },
  {
    id: '4',
    name: 'Luis',
    role: 'Técnico de Luz',
    percentageShare: 10,
    totalPaid: 2500,
    pendingAmount: 500
  }
];

// Monthly financial data
export const mockMonthlyData: MonthlyData[] = [
  { month: 'Jan', income: 12000, expenses: 5000, profit: 7000 },
  { month: 'Fev', income: 14000, expenses: 5500, profit: 8500 },
  { month: 'Mar', income: 11000, expenses: 4800, profit: 6200 },
  { month: 'Abr', income: 15000, expenses: 6000, profit: 9000 },
  { month: 'Mai', income: 13500, expenses: 5200, profit: 8300 },
  { month: 'Jun', income: 16000, expenses: 6500, profit: 9500 }
];

// Income categories
export const mockIncomeCategories: CategoryData[] = [
  { name: 'Shows', value: 65000, percentage: 65 },
  { name: 'Campanhas', value: 20000, percentage: 20 },
  { name: 'Patrocínios', value: 10000, percentage: 10 },
  { name: 'Outros', value: 5000, percentage: 5 }
];

// Expense categories
export const mockExpenseCategories: CategoryData[] = [
  { name: 'Equipamento', value: 10000, percentage: 30 },
  { name: 'Equipe', value: 8000, percentage: 25 },
  { name: 'Transporte', value: 5000, percentage: 15 },
  { name: 'Marketing', value: 4000, percentage: 12 },
  { name: 'Hospedagem', value: 3000, percentage: 9 },
  { name: 'Alimentação', value: 2000, percentage: 6 },
  { name: 'Outros', value: 1000, percentage: 3 }
];

// Dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalRevenue: 81000,
  totalExpenses: 33000,
  netProfit: 48000,
  averageRevenuePerShow: 4050,
  averageCostPerEvent: 670,
  eventCount: 20,
  upcomingEvents: 5,
  clientCount: 12
};
