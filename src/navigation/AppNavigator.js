import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main App
import MainTabNavigator from './MainTabNavigator';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import SetBudgetScreen from '../screens/main/SetBudgetScreen';
import ExpenseDetailScreen from '../screens/main/ExpenseDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    async function init() {
      // Minimal splash 1.5s
      await new Promise(res => setTimeout(res, 1500));

      // Check first launch
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');

      if (!hasLaunched) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }

      setIsLoading(false);
    }

    init();
  }, []);

  // Saat Splash OR Auth Firebase masih loading
  if (isLoading || authLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* USER IS NOT LOGIN */}
        {!user && (
          <>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}

            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}

        {/* USER IS LOGIN */}
        {user && (
          <>
            <Stack.Screen name="MainApp" component={MainTabNavigator} />

            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="SetBudget" component={SetBudgetScreen} />
            <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
