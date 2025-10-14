import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { ExpenseContext } from '../context/ExpenseContext';

export default function BudgetManagementScreen() {
  const { currency, budgets, setBudget, getBudgetStatus } = useContext(ExpenseContext);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');

  const handleSetBudget = (categoryId, period, amount) => {
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }
    setBudget(categoryId, period, amount);
    setEditingCategory(null);
    setEditingPeriod(null);
    setEditingAmount('');
  };

  const renderBudgetCard = (category, period) => {
    const status = getBudgetStatus(category.id, period);
    
    const getStatusColor = (statusType) => {
      switch (statusType) {
        case 'exceeded': return '#EF4444';
        case 'warning': return '#F59E0B';
        case 'caution': return '#10B981';
        default: return '#6366F1';
      }
    };

    return (
      <View style={styles.budgetCard} key={`${category.id}-${period}`}>
        <View style={styles.budgetHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon} size={24} color="#fff" />
            </View>
            <View style={styles.categoryText}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.periodText}>
                {period.charAt(0).toUpperCase() + period.slice(1)} Budget
              </Text>
            </View>
          </View>
          {status && (
            <TouchableOpacity
              onPress={() => {
                setEditingCategory(category.id);
                setEditingPeriod(period);
                setEditingAmount(status.budget.toString());
              }}
            >
              <Ionicons name="pencil" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {editingCategory === category.id && editingPeriod === period ? (
          <View style={styles.editBudget}>
            <TextInput
              style={styles.budgetInput}
              value={editingAmount}
              onChangeText={setEditingAmount}
              keyboardType="numeric"
              placeholder="Enter budget amount"
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setEditingCategory(null);
                  setEditingPeriod(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={() => handleSetBudget(category.id, period, parseFloat(editingAmount))}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : status ? (
          <View>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetAmount}>
                {currency} {status.spent.toFixed(2)} / {status.budget.toFixed(2)}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor(status.status) }]}>
                {status.percentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${status.percentage}%`,
                    backgroundColor: getStatusColor(status.status)
                  }
                ]} 
              />
            </View>
            <Text style={styles.remainingText}>
              {status.remaining > 0 
                ? `${currency} ${status.remaining.toFixed(2)} remaining`
                : 'Budget exceeded'}
            </Text>
          </View>
        ) : (
          <View style={styles.setBudget}>
            <TouchableOpacity
              style={styles.setBudgetButton}
              onPress={() => {
                setEditingCategory(category.id);
                setEditingPeriod(period);
                setEditingAmount('');
              }}
            >
              <Text style={styles.setBudgetText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Budgets</Text>
        {CATEGORIES.map((category) => renderBudgetCard(category, 'monthly'))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Budgets</Text>
        {CATEGORIES.map((category) => renderBudgetCard(category, 'weekly'))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  periodText: {
    fontSize: 14,
    color: '#64748B',
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    color: '#64748B',
  },
  editBudget: {
    marginTop: 8,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  setBudget: {
    marginTop: 8,
  },
  setBudgetButton: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  setBudgetText: {
    color: '#6366F1',
    fontWeight: '600',
  },
});