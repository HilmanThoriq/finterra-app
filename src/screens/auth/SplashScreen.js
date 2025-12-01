import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Check if user has seen onboarding
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        
        // Wait 2 seconds then navigate
        setTimeout(() => {
          if (hasSeenOnboarding === 'true') {
            // User sudah pernah buka app → Skip onboarding
            navigation.replace('Login'); // Atau 'Home' jika sudah login
          } else {
            // First time user → Show onboarding
            navigation.replace('Onboarding');
          }
        }, 2000); // 2 detik splash screen
      } catch (error) {
        console.error('Error checking onboarding:', error);
        navigation.replace('Onboarding');
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <Image
          source={require('../../../assets/images/finterra-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* App Name */}
        <Text style={styles.appName}>FINTERRA</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Track Your Spending, Control Your Budget</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary, 
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: Colors.primary, 
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});