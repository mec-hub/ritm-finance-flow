
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '@/types';
import { mockTransactions } from '@/data/mockData';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  refreshTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  // Initialize with mock data and store in localStorage for persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('financialTransactions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
        return [...mockTransactions];
      }
    }
    return [...mockTransactions];
  });

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('financialTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const updateTransaction = (id: string, updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? updatedTransaction : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const refreshTransactions = () => {
    // Force a refresh from localStorage
    const stored = localStorage.getItem('financialTransactions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTransactions(parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })));
      } catch (error) {
        console.error('Error refreshing transactions:', error);
      }
    }
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refreshTransactions
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
