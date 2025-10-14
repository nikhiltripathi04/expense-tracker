import { Stack } from 'expo-router';
import BudgetManagementScreen from '../src/screens/BudgetManagementScreen';

export default function BudgetManagement() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Budget Management',
          headerShadowVisible: false,
          headerBackTitle: 'Settings',
        }}
      />
      <BudgetManagementScreen />
    </>
  );
}