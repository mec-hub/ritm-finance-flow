
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  color: string;
  usageCount?: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Get categories with usage statistics
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('display_order', { ascending: true });

    if (categoriesError) throw categoriesError;

    // Get usage statistics for each category
    const { data: usageData, error: usageError } = await supabase
      .from('transactions')
      .select('category, date')
      .eq('user_id', userData.user.id)
      .not('category', 'is', null);

    if (usageError) throw usageError;

    // Calculate usage statistics
    const usageMap = new Map<string, { count: number; lastUsed: Date }>();
    usageData?.forEach(transaction => {
      if (transaction.category) {
        const existing = usageMap.get(transaction.category);
        const currentDate = new Date(transaction.date);
        
        if (existing) {
          existing.count += 1;
          if (currentDate > existing.lastUsed) {
            existing.lastUsed = currentDate;
          }
        } else {
          usageMap.set(transaction.category, {
            count: 1,
            lastUsed: currentDate
          });
        }
      }
    });

    return categoriesData?.map(category => ({
      id: category.id,
      name: category.name,
      displayOrder: category.display_order,
      color: category.color,
      usageCount: usageMap.get(category.name)?.count || 0,
      lastUsed: usageMap.get(category.name)?.lastUsed,
      createdAt: new Date(category.created_at),
      updatedAt: new Date(category.updated_at)
    })) || [];
  }

  static async getCategoriesForDropdown(): Promise<string[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', userData.user.id)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return data?.map(category => category.name) || [];
  }

  static async addCategory(categoryName: string, color?: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    if (!categoryName.trim()) {
      throw new Error('Category name cannot be empty');
    }

    // Get the highest display order to add the new category at the end
    const { data: maxOrderData } = await supabase
      .from('categories')
      .select('display_order')
      .eq('user_id', userData.user.id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;

    const { error } = await supabase
      .from('categories')
      .insert({
        name: categoryName.trim(),
        user_id: userData.user.id,
        display_order: nextOrder,
        color: color || '#6B7280'
      });

    if (error) throw error;
  }

  static async updateCategory(categoryId: string, updates: { name?: string; color?: string }): Promise<void> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.color !== undefined) updateData.color = updates.color;

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId);

    if (error) throw error;
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  }

  static async reorderCategories(categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map((id, index) => ({
      id,
      display_order: index + 1
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('categories')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) throw error;
    }
  }
}
