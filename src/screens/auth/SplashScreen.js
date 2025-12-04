import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import Colors from '../../constants/Colors';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('../../../assets/images/finterra-logo.png')}
          style={styles.logo}
        />
        <Text style={styles.appName}>FINTERRA</Text>
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
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
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
