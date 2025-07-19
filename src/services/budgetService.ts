import { supabase } from '@/integrations/supabase/client';
import { Budget, BudgetAttachment, CreateBudgetData, UpdateBudgetData } from '@/types/budget';

export class BudgetService {
  static async getAll(): Promise<Budget[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Fetching budgets for user:', user.user.id);
    
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('BudgetService - Error fetching budgets:', error);
      throw error;
    }

    console.log('BudgetService - Fetched budgets:', data);
    return (data || []).map(item => ({
      ...item,
      status: item.status as Budget['status']
    }));
  }

  static async getById(id: string): Promise<Budget | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Fetching budget by id:', id);
    
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      console.error('BudgetService - Error fetching budget:', error);
      throw error;
    }

    return data ? {
      ...data,
      status: data.status as Budget['status']
    } : null;
  }

  static async create(budgetData: CreateBudgetData): Promise<Budget> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Creating budget:', budgetData);

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        user_id: user.user.id,
        tags: budgetData.tags || [],
        metadata: budgetData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('BudgetService - Error creating budget:', error);
      throw error;
    }

    console.log('BudgetService - Created budget:', data);
    return {
      ...data,
      status: data.status as Budget['status']
    };
  }

  static async update(id: string, budgetData: UpdateBudgetData): Promise<Budget> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Updating budget:', id, budgetData);

    const { data, error } = await supabase
      .from('budgets')
      .update(budgetData)
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('BudgetService - Error updating budget:', error);
      throw error;
    }

    console.log('BudgetService - Updated budget:', data);
    return {
      ...data,
      status: data.status as Budget['status']
    };
  }

  static async delete(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Deleting budget:', id);

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('BudgetService - Error deleting budget:', error);
      throw error;
    }

    console.log('BudgetService - Deleted budget:', id);
  }

  static async search(query: string, filters: { type?: string; status?: string; tags?: string[] } = {}): Promise<Budget[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Searching budgets:', query, filters);

    let queryBuilder = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.user.id);

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters.type) {
      queryBuilder = queryBuilder.eq('budget_type', filters.type);
    }

    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', filters.tags);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      console.error('BudgetService - Error searching budgets:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as Budget['status']
    }));
  }

  static async getAttachments(budgetId: string): Promise<BudgetAttachment[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Fetching attachments for budget:', budgetId);

    const { data, error } = await supabase
      .from('budget_attachments')
      .select('*')
      .eq('budget_id', budgetId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('BudgetService - Error fetching attachments:', error);
      throw error;
    }

    return data || [];
  }

  static async uploadAttachment(budgetId: string, file: File): Promise<BudgetAttachment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Uploading attachment for budget:', budgetId, file.name);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.user.id}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('budget-attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('BudgetService - Error uploading file:', uploadError);
      throw uploadError;
    }

    // Create attachment record
    const { data, error } = await supabase
      .from('budget_attachments')
      .insert({
        budget_id: budgetId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type
      })
      .select()
      .single();

    if (error) {
      console.error('BudgetService - Error creating attachment record:', error);
      throw error;
    }

    console.log('BudgetService - Uploaded attachment:', data);
    return data;
  }

  static async deleteAttachment(attachmentId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    console.log('BudgetService - Deleting attachment:', attachmentId);

    // Get attachment info first
    const { data: attachment, error: fetchError } = await supabase
      .from('budget_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) {
      console.error('BudgetService - Error fetching attachment:', fetchError);
      throw fetchError;
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('budget-attachments')
      .remove([attachment.file_path]);

    if (storageError) {
      console.error('BudgetService - Error deleting file from storage:', storageError);
    }

    // Delete attachment record
    const { error } = await supabase
      .from('budget_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      console.error('BudgetService - Error deleting attachment record:', error);
      throw error;
    }

    console.log('BudgetService - Deleted attachment:', attachmentId);
  }

  static getAttachmentUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('budget-attachments')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}
