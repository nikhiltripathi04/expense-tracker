import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveExpenses();
    }
  }, [expenses]);

  useEffect(() => {
    if (!isLoading) {
      saveCurrency();
    }
  }, [currency]);

  useEffect(() => {
    if (!isLoading) {
      saveBudgets();
    }
  }, [budgets]);

  const loadData = async () => {
    try {
      const [storedExpenses, storedCurrency, storedBudgets] = await Promise.all([
        AsyncStorage.getItem('expenses'),
        AsyncStorage.getItem('currency'),
        AsyncStorage.getItem('budgets'),
      ]);
      
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async () => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const saveCurrency = async () => {
    try {
      await AsyncStorage.setItem('currency', currency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const saveBudgets = async () => {
    try {
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  };

  const addExpense = (expense) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      date: expense.date || new Date().toISOString(),
      currency: currency,
    };
    setExpenses([newExpense, ...expenses]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      )
    );
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const setBudget = (categoryId, period, amount) => {
    setBudgets({
      ...budgets,
      [categoryId]: {
        ...budgets[categoryId],
        [period]: parseFloat(amount),
      },
    });
  };

  const getBudget = (categoryId, period) => {
    return budgets[categoryId]?.[period] || 0;
  };

  const getCategorySpending = (categoryId, period) => {
    const now = new Date();
    const filtered = expenses.filter((expense) => {
      if (expense.categoryId !== categoryId) return false;
      
      const expenseDate = new Date(expense.date);
      
      switch (period) {
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return expenseDate >= weekAgo;
        case 'monthly':
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        default:
          return false;
      }
    });
    
    return filtered.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  const getBudgetStatus = (categoryId, period) => {
    const budget = getBudget(categoryId, period);
    if (budget === 0) return null;
    
    const spent = getCategorySpending(categoryId, period);
    const percentage = (spent / budget) * 100;
    const remaining = budget - spent;
    
    let status = 'safe';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= 80) status = 'warning';
    else if (percentage >= 60) status = 'caution';
    
    return {
      budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100),
      status,
    };
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        deleteExpense,
        updateExpense,
        getTotalExpenses,
        isLoading,
        currency,
        changeCurrency,
        budgets,
        setBudget,
        getBudget,
        getCategorySpending,
        getBudgetStatus,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};