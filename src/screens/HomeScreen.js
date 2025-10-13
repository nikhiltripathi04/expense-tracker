import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseContext } from '../context/ExpenseContext';
import { CATEGORIES } from '../constants/categories';

export default function HomeScreen() {
  const { expenses, deleteExpense, getTotalExpenses } = useContext(ExpenseContext);

  const getCategoryDetails = (categoryId) => {
    return CATEGORIES.find((cat) => cat.id === categoryId) || CATEGORIES[6]; // Default to 'Other'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = (id, description) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }) => {
    const category = getCategoryDetails(item.categoryId);

    return (
      <View style={styles.expenseItem}>
        <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={24} color="#fff" />
        </View>
        
        <View style={styles.expenseDetails}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{category.name}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${parseFloat(item.amount).toFixed(2)}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.description)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalAmount}>${getTotalExpenses().toFixed(2)}</Text>
        <Text style={styles.expenseCount}>
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </Text>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyText}>No expenses yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button below to add your first expense
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  totalContainer: {
    backgroundColor: '#6366F1',
    padding: 24,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseCount: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});