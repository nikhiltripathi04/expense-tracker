import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { ExpenseContext } from '../../src/context/ExpenseContext';
import { CATEGORIES } from '../../src/constants/categories';
import { CURRENCIES } from '../../src/constants/currencies';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const { expenses, getTotalExpenses, currency } = useContext(ExpenseContext);
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '₹';
  const [timeFilter, setTimeFilter] = useState('month');

  const getFilteredExpenses = () => {
    const now = new Date();
    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      
      switch (timeFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return expenseDate >= weekAgo;
        case 'month':
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        case 'year':
          return expenseDate.getFullYear() === now.getFullYear();
        case 'all':
        default:
          return true;
      }
    });
    return filtered;
  };

  const getCategoryData = () => {
    const filteredExpenses = getFilteredExpenses();
    const categoryTotals = {};

    filteredExpenses.forEach((expense) => {
      if (categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId] += parseFloat(expense.amount);
      } else {
        categoryTotals[expense.categoryId] = parseFloat(expense.amount);
      }
    });

    return Object.entries(categoryTotals).map(([categoryId, amount]) => {
      const category = CATEGORIES.find((cat) => cat.id === categoryId);
      return {
        name: category?.name || 'Other',
        amount,
        color: category?.color || '#BDB76B',
        legendFontColor: '#64748B',
        legendFontSize: 12,
      };
    });
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] += parseFloat(expense.amount);
      } else {
        monthlyTotals[monthYear] = parseFloat(expense.amount);
      }
    });

    const sortedMonths = Object.entries(monthlyTotals)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA - dateB;
      })
      .slice(-6);

    return {
      labels: sortedMonths.map(([month]) => month.split(' ')[0]),
      datasets: [
        {
          data: sortedMonths.map(([, total]) => total),
        },
      ],
    };
  };

  const filteredExpenses = getFilteredExpenses();
  const totalFiltered = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );
  const categoryData = getCategoryData();
  const monthlyData = getMonthlyData();

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filterContainer}>
        {['week', 'month', 'year', 'all'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              timeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setTimeFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                timeFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>
          Total ({timeFilter === 'all' ? 'All Time' : `This ${timeFilter}`})
        </Text>
        <Text style={styles.totalAmount}>${totalFiltered.toFixed(2)}</Text>
        <Text style={styles.expenseCount}>
          {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
        </Text>
      </View>

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyText}>No data for this period</Text>
          <Text style={styles.emptySubtext}>
            Add some expenses to see statistics
          </Text>
        </View>
      ) : (
        <>
          {categoryData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              <PieChart
                data={categoryData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          <View style={styles.categoryListCard}>
            <Text style={styles.chartTitle}>Category Breakdown</Text>
            {categoryData
              .sort((a, b) => b.amount - a.amount)
              .map((item, index) => {
                const percentage = ((item.amount / totalFiltered) * 100).toFixed(1);
                return (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryItemLeft}>
                      <View
                        style={[styles.categoryDot, { backgroundColor: item.color }]}
                      />
                      <Text style={styles.categoryItemName}>{item.name}</Text>
                    </View>
                    <View style={styles.categoryItemRight}>
                      <Text style={styles.categoryItemAmount}>
                        ${item.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.categoryItemPercentage}>{percentage}%</Text>
                    </View>
                  </View>
                );
              })}
          </View>

          {expenses.length > 0 && monthlyData.labels.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Monthly Trend</Text>
              <BarChart
                data={monthlyData}
                width={screenWidth - 48}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={0}
                fromZero
                showValuesOnTopOfBars
                style={styles.barChart}
              />
            </View>
          )}

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#6366F1" />
              <Text style={styles.statValue}>
                ${(totalFiltered / Math.max(filteredExpenses.length, 1)).toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Avg per Expense</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={24} color="#10B981" />
              <Text style={styles.statValue}>
                {filteredExpenses.length > 0
                  ? Math.max(...filteredExpenses.map((e) => parseFloat(e.amount))).toFixed(2)
                  : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Highest Expense</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  totalCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  expenseCount: {
    fontSize: 14,
    color: '#94A3B8',
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  barChart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  categoryListCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryItemName: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryItemRight: {
    alignItems: 'flex-end',
  },
  categoryItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  categoryItemPercentage: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
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