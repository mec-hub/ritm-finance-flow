export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category: string;
  subcategory?: string;
  isRecurring: boolean;
  recurrenceInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurrenceMonths?: number;
  type: 'income' | 'expense';
  eventId?: string;
  clientId?: string;
  teamMemberId?: string; // For backward compatibility
  teamPercentages?: TeamPercentageAssignment[];
  notes?: string;
  percentageValue?: number; // For backward compatibility
  status?: 'paid' | 'not_paid' | 'canceled';
  attachments?: string[]; // Array of file URLs or base64 strings
  files?: File[]; // For temporary file storage during upload
}

export interface TeamPercentageAssignment {
  teamMemberId: string;
  percentageValue: number;
  teamMemberName?: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  client: string;
  clientId?: string; // Add this for editing functionality
  estimatedRevenue: number;
  actualRevenue?: number;
  estimatedExpenses: number;
  actualExpenses?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  // New location fields
  placeName?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  // New time fields
  startTime?: string;
  endTime?: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone?: string;
  totalRevenue: number;
  lastEvent?: Date;
  notes?: string;
  websiteUrl?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
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

export * from './budget';
