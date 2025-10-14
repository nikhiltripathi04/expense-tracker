import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseContext } from '../context/ExpenseContext';
import { CATEGORIES } from '../constants/categories';

export default function RecurringExpensesScreen() {
  const {
    currency,
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useContext(ExpenseContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    frequency: 'monthly',
  });

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.categoryId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingExpense) {
      updateRecurringExpense(editingExpense.id, expenseData);
    } else {
      addRecurringExpense(expenseData);
    }

    setShowAddModal(false);
    setEditingExpense(null);
    setFormData({
      amount: '',
      description: '',
      categoryId: '',
      frequency: 'monthly',
    });
  };

  const handleDelete = (expense) => {
    Alert.alert(
      'Delete Recurring Expense',
      'Are you sure you want to delete this recurring expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecurringExpense(expense.id),
        },
      ]
    );
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      categoryId: expense.categoryId,
      frequency: expense.frequency,
    });
    setShowAddModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          recurringExpenses.length === 0 && styles.scrollViewEmpty
        ]}
      >
        {recurringExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="repeat-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No recurring expenses yet</Text>
            <Text style={styles.emptyText}>
              Add your subscriptions and regular payments to track them automatically
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <View style={styles.addFirstButtonContent}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addFirstButtonText}>Add Your First Recurring Expense</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          recurringExpenses.map((expense) => {
            const category = CATEGORIES.find((c) => c.id === expense.categoryId);
            return (
              <View key={expense.id} style={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: category?.color || '#BDB76B' },
                      ]}
                    >
                      <Ionicons
                        name={category?.icon || 'ellipsis-horizontal'}
                        size={24}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>
                        {expense.description}
                      </Text>
                      <Text style={styles.expenseFrequency}>
                        {frequencies.find((f) => f.value === expense.frequency)?.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>
                    {currency} {expense.amount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(expense)}
                  >
                    <Ionicons name="pencil" size={20} color="#6366F1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(expense)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExpense ? 'Edit' : 'Add'} Recurring Expense
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingExpense(null);
                }}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(text) =>
                    setFormData({ ...formData, amount: text })
                  }
                  placeholder="Enter amount"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Enter description"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                {/* FIX: Removed horizontal ScrollView to allow flexWrap: 'wrap' to work */}
                <View style={styles.categoryList}> 
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        formData.categoryId === category.id &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, categoryId: category.id })
                      }
                    >
                      <Ionicons
                        name={category.icon}
                        size={24}
                        color={
                          formData.categoryId === category.id
                            ? '#fff'
                            : category.color
                        }
                      />
                      <Text
                        style={[
                          styles.categoryButtonText,
                          formData.categoryId === category.id &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* END FIX */}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyButtons}>
                  {frequencies.map((freq) => (
                    <TouchableOpacity
                      key={freq.value}
                      style={[
                        styles.frequencyButton,
                        formData.frequency === freq.value &&
                          styles.frequencyButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, frequency: freq.value })
                      }
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          formData.frequency === freq.value &&
                            styles.frequencyButtonTextActive,
                        ]}
                      >
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingExpense(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingExpense ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollViewEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginTop: 8,
  },
  addFirstButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  expenseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    marginLeft: 12,
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  expenseFrequency: {
    fontSize: 14,
    color: '#64748B',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6366F1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Removed marginRight: 8, to rely on gap: 8
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  frequencyButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  submitButton: {
    backgroundColor: '#6366F1',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});