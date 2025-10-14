import { Stack } from 'expo-router';
import RecurringExpensesScreen from '../src/screens/RecurringExpensesScreen';

export default function RecurringExpenses() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Recurring Expenses',
          headerShadowVisible: false,
          headerBackTitle: 'Settings',
        }}
      />
      <RecurringExpensesScreen />
    </>
  );
}