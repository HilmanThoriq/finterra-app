// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

// Temporary Home Screen - Replace with your actual home screen
function TemporaryHomeScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: Colors.surface,
      padding: 20
    }}>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: Colors.primary,
        marginBottom: 12
      }}>
        Welcome to Finterra!
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: Colors.textSecondary,
        marginBottom: 8 
      }}>
        Logged in as: {user?.displayName}
      </Text>
      <Text style={{ 
        fontSize: 14, 
        color: Colors.textTertiary,
        marginBottom: 32
      }}>
        {user?.email}
      </Text>
      
      <View style={{
        backgroundColor: '#f0fdf4',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#86efac',
      }}>
        <Text style={{ fontSize: 14, color: '#166534', textAlign: 'center' }}>
          ✅ Authentication working!{'\n'}
          Replace this with your HomeScreen
        </Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: Colors.danger,
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 26,
        }}
        onPress={async () => await signOut()}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  
  const [appState, setAppState] = useState('splash'); // 'splash' | 'ready'
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Check if first time launch
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        const firstTime = hasLaunched === null;
        
        if (firstTime) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('hasLaunched', 'true');
        } else {
          setIsFirstLaunch(false);
        }

        // 2. Wait for 3 seconds (Splash screen duration)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Mark app as ready
        setAppState('ready');

      } catch (error) {
        console.error('Error initializing app:', error);
        setIsFirstLaunch(false);
        setAppState('ready');
      }
    }

    initializeApp();
  }, []);

  // ALWAYS show SplashScreen for 3 seconds first
  if (appState === 'splash' || authLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {user ? (
          // ============================================
          // USER IS LOGGED IN → Go to Home
          // ============================================
          <>
            <Stack.Screen name="Home" component={TemporaryHomeScreen} />
            {/* TODO: Add your other main screens here */}
          </>
        ) : (
          // ============================================
          // USER NOT LOGGED IN → Auth Flow
          // ============================================
          <>
            {isFirstLaunch ? (
              // First time user: Onboarding → Login → Register
              <>
                <Stack.Screen 
                  name="Onboarding" 
                  component={OnboardingScreen}
                  options={{ animationEnabled: true }}
                />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              // Returning user: Login → Register (no onboarding)
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}