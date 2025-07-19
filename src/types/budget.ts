
export interface Budget {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  budget_type: string;
  status: 'draft' | 'active' | 'archived' | 'completed';
  amount?: number;
  period_start?: string;
  period_end?: string;
  external_url?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BudgetAttachment {
  id: string;
  budget_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  uploaded_at: string;
}

export interface CreateBudgetData {
  name: string;
  description?: string;
  budget_type: string;
  status?: 'draft' | 'active' | 'archived' | 'completed';
  amount?: number;
  period_start?: string;
  period_end?: string;
  external_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}
