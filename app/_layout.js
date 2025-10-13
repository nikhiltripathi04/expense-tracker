import { Stack } from 'expo-router';
import { ExpenseProvider } from '../src/context/ExpenseContext';

export default function RootLayout() {
  return (
    <ExpenseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ExpenseProvider>
  );
}