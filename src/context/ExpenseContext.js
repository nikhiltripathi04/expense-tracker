import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [budgets, setBudgets] = useState({});
  const [recurringExpenses, setRecurringExpenses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // Check and generate recurring expenses daily
  useEffect(() => {
    if (!isLoading) {
      handleRecurringExpenses();
      const interval = setInterval(handleRecurringExpenses, 24 * 60 * 60 * 1000); // Check daily
      return () => clearInterval(interval);
    }
  }, [isLoading, recurringExpenses]);

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

  useEffect(() => {
    if (!isLoading) {
      saveRecurringExpenses();
    }
  }, [recurringExpenses]);

  const loadData = async () => {
    try {
      const [storedExpenses, storedCurrency, storedBudgets, storedRecurring] = await Promise.all([
        AsyncStorage.getItem('expenses'),
        AsyncStorage.getItem('currency'),
        AsyncStorage.getItem('budgets'),
        AsyncStorage.getItem('recurringExpenses'),
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
      if (storedRecurring) {
        setRecurringExpenses(JSON.parse(storedRecurring));
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

  const saveRecurringExpenses = async () => {
    try {
      await AsyncStorage.setItem('recurringExpenses', JSON.stringify(recurringExpenses));
    } catch (error) {
      console.error('Error saving recurring expenses:', error);
    }
  };

  const handleRecurringExpenses = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    recurringExpenses.forEach((recurring) => {
      const lastGenerated = new Date(recurring.lastGenerated);
      let nextDate = new Date(lastGenerated);

      switch (recurring.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }

      // If next generation date is today or in the past, generate the expense
      if (nextDate <= today) {
        const newExpense = {
          amount: recurring.amount,
          categoryId: recurring.categoryId,
          description: recurring.description,
          date: new Date().toISOString(),
          currency: currency,
          isRecurring: true,
          recurringId: recurring.id
        };
        addExpense(newExpense);

        // Update last generated date
        setRecurringExpenses(prevRecurring =>
          prevRecurring.map(item =>
            item.id === recurring.id
              ? { ...item, lastGenerated: new Date().toISOString() }
              : item
          )
        );
      }
    });
  };

  const addRecurringExpense = (expense) => {
    const newRecurring = {
      id: Date.now().toString(),
      ...expense,
      lastGenerated: new Date().toISOString(),
      isActive: true
    };
    setRecurringExpenses([...recurringExpenses, newRecurring]);
  };

  const updateRecurringExpense = (id, updates) => {
    setRecurringExpenses(prevRecurring =>
      prevRecurring.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteRecurringExpense = (id) => {
    setRecurringExpenses(prevRecurring =>
      prevRecurring.filter(item => item.id !== id)
    );
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
        recurringExpenses,
        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};