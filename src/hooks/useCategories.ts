
import { useState, useEffect } from 'react';
import { CategoryService, Category } from '@/services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dropdownCategories, setDropdownCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allCategories, dropdownCats] = await Promise.all([
        CategoryService.getAllCategories(),
        CategoryService.getCategoriesForDropdown()
      ]);
      setCategories(allCategories);
      setDropdownCategories(dropdownCats);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string) => {
    try {
      await CategoryService.addCategory(name);
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (oldName: string, newName: string) => {
    try {
      await CategoryService.updateCategoryName(oldName, newName);
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (name: string) => {
    try {
      await CategoryService.deleteCategory(name);
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    dropdownCategories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
}
