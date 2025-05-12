
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category: string;
  subcategory?: string;
  isRecurring: boolean;
  recurrenceInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  type: 'income' | 'expense';
  eventId?: string;
  clientId?: string;
  teamMemberId?: string; // For backward compatibility
  teamPercentages?: TeamPercentageAssignment[];
  attachments?: string[];
  notes?: string;
  percentageValue?: number; // For backward compatibility
}

export interface TeamPercentageAssignment {
  teamMemberId: string;
  percentageValue: number;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  client: string;
  estimatedRevenue: number;
  actualRevenue?: number;
  estimatedExpenses: number;
  actualExpenses?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  totalRevenue: number;
  lastEvent?: Date;
  notes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  percentageShare: number;
  totalPaid: number;
  pendingAmount: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageRevenuePerShow: number;
  averageCostPerEvent: number;
  eventCount: number;
  upcomingEvents: number;
  clientCount: number;
}

export interface ContributorStats {
  id: string;
  name: string;
  role: string;
  income: number;
  expenses: number;
  profit: number;
  transactionCount: number;
}
