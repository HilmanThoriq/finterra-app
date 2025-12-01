import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Track Every Expense',
    description: 'Record your spending with precise location data. Know exactly where your money goes.',
    image: require('../../../assets/images/intro-1.png'),
  },
  {
    id: 2,
    title: 'Set Smart Budgets',
    description: 'Create monthly budgets and get real-time alerts when approaching your limit.',
    image: require('../../../assets/images/intro-2.png'),
  },
  {
    id: 3,
    title: 'Location-Based Alerts',
    description: "Receive smart notifications when you're in shopping areas and your budget is exceeded.",
    image: require('../../../assets/images/intro-3.png'),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSlide = slides[currentIndex];

  // Handle Skip - Only on first slide, goes to slide 3 (index 2)
  const handleSkip = () => {
    setCurrentIndex(2); // Jump to last slide (index 2)
  };

  // Handle Next/Get Started button
  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      // Not last slide → Go to next slide
      setCurrentIndex(currentIndex + 1);
    } else {
      // Last slide → Go to Register
      try {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        navigation.replace('Register'); 
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button - Only show on first slide (index 0) */}
      {currentIndex === 0 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Current Slide Content */}
      <View style={styles.slideContainer}>
        {/* Image/Icon - Centered with more margin */}
        <View style={styles.imageContainer}>
          <Image 
            source={currentSlide.image} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{currentSlide.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{currentSlide.description}</Text>
      </View>

      {/* Footer: Dots + Button */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started Button - Fully Rounded */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, 
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, 
  },
  imageContainer: {
    width: width * 0.55,
    height: width * 0.55, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20, 
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24, 
    backgroundColor: Colors.primary, 
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});