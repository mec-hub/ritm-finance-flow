
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  name: string;
  usageCount: number;
  lastUsed?: Date;
}

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Get all unique categories from transactions with their usage count
    const { data, error } = await supabase
      .from('transactions')
      .select('category, date')
      .eq('user_id', userData.user.id)
      .not('category', 'is', null);

    if (error) throw error;

    // Process categories to get unique ones with usage statistics
    const categoryMap = new Map<string, { count: number; lastUsed: Date }>();
    
    data?.forEach(transaction => {
      if (transaction.category) {
        const existing = categoryMap.get(transaction.category);
        const currentDate = new Date(transaction.date);
        
        if (existing) {
          existing.count += 1;
          if (currentDate > existing.lastUsed) {
            existing.lastUsed = currentDate;
          }
        } else {
          categoryMap.set(transaction.category, {
            count: 1,
            lastUsed: currentDate
          });
        }
      }
    });

    // Convert to array format
    return Array.from(categoryMap.entries()).map(([name, stats]) => ({
      name,
      usageCount: stats.count,
      lastUsed: stats.lastUsed
    })).sort((a, b) => b.usageCount - a.usageCount);
  }

  static async updateCategoryName(oldName: string, newName: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('transactions')
      .update({ category: newName })
      .eq('user_id', userData.user.id)
      .eq('category', oldName);

    if (error) throw error;
  }

  static async deleteCategory(categoryName: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Set category to null for transactions with this category
    const { error } = await supabase
      .from('transactions')
      .update({ category: null })
      .eq('user_id', userData.user.id)
      .eq('category', categoryName);

    if (error) throw error;
  }

  static async createTransaction(category: string): Promise<void> {
    // This is just to create a category by creating a sample transaction
    // In real usage, categories are created when transactions are added
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // We don't actually create a transaction here, just validate the category name
    if (!category.trim()) {
      throw new Error('Category name cannot be empty');
    }
  }
}
