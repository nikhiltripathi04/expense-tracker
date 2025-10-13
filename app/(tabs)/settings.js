import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseContext } from '../../src/context/ExpenseContext';
import { CURRENCIES } from '../../src/constants/currencies';

export default function SettingsScreen() {
  const { currency, changeCurrency, expenses, deleteExpense } = useContext(ExpenseContext);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const currentCurrency = CURRENCIES.find((c) => c.code === currency);

  const handleCurrencyChange = (newCurrency) => {
    changeCurrency(newCurrency);
    setShowCurrencyModal(false);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all expenses? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all expenses one by one
              const expenseIds = expenses.map(e => e.id);
              expenseIds.forEach(id => deleteExpense(id));
              
              // Also clear from AsyncStorage
              await AsyncStorage.removeItem('expenses');
              
              Alert.alert('Success', 'All expenses have been deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      `You have ${expenses.length} expenses to export. This feature will be available soon!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Currency Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowCurrencyModal(true)}
        >
          <View style={styles.settingItemLeft}>
            <Ionicons name="cash-outline" size={24} color="#6366F1" />
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Currency</Text>
              <Text style={styles.settingItemSubtitle}>
                {currentCurrency?.name} ({currentCurrency?.symbol})
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={exportData}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="download-outline" size={24} color="#10B981" />
            <View style={styles.settingItemText}>
              <Text style={styles.settingItemTitle}>Export Data</Text>
              <Text style={styles.settingItemSubtitle}>
                Download your expenses as CSV
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem]}
          onPress={handleClearData}
        >
          <View style={styles.settingItemLeft}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <View style={styles.settingItemText}>
              <Text style={[styles.settingItemTitle, styles.dangerText]}>
                Clear All Data
              </Text>
              <Text style={styles.settingItemSubtitle}>
                Delete all expenses permanently
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total Expenses</Text>
          <Text style={styles.infoValue}>{expenses.length}</Text>
        </View>
      </View>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.currencyList}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyItem,
                    currency === curr.code && styles.currencyItemSelected,
                  ]}
                  onPress={() => handleCurrencyChange(curr.code)}
                >
                  <View>
                    <Text style={styles.currencyName}>{curr.name}</Text>
                    <Text style={styles.currencyCode}>
                      {curr.code} - {curr.symbol}
                    </Text>
                  </View>
                  {currency === curr.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 12,
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerText: {
    color: '#EF4444',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
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
    maxHeight: '80%',
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
  currencyList: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  currencyItemSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    color: '#64748B',
  },
});