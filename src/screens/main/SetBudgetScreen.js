// src/screens/main/SetBudgetScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import authService from '../../services/authService';
import firestoreService from '../../services/firestoreService';

export default function SetBudgetScreen({ navigation }) {
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(0);

  const suggestions = [500000, 1000000, 1500000, 2000000, 5000000];

  // Load existing budget saat component mount
  useEffect(() => {
    loadExistingBudget();
  }, []);

  const loadExistingBudget = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please login first');
        navigation.goBack();
        return;
      }

      const existingBudget = await firestoreService.getMonthlyBudget(user.uid);

      if (existingBudget > 0) {
        setCurrentBudget(existingBudget);
        setBudget(formatNumber(existingBudget.toString()));
      } else {
        setCurrentBudget(0);
        setBudget('');
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      Alert.alert('Error', 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  const dailyBudget = budget ? Math.floor(parseInt(budget.replace(/\./g, '')) / 30) : 0;

  const handleSave = async () => {
    if (!budget || parseInt(budget.replace(/\./g, '')) === 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    setSaving(true);

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const budgetAmount = parseInt(budget.replace(/\./g, ''));
      const result = await firestoreService.setMonthlyBudget(user.uid, budgetAmount);

      if (result.success) {
        Alert.alert(
          'Success',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save budget');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (text) => {
    const number = text.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getCurrentMonthYear = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading budget...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Monthly Budget</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Current Budget Display */}
        {currentBudget > 0 && (
          <View style={styles.currentBudgetCard}>
            <Text style={styles.currentBudgetLabel}>Current Budget for {getCurrentMonthYear()}</Text>
            <Text style={styles.currentBudgetAmount}>
              Rp {currentBudget.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.currentBudgetHint}>You can update your budget below</Text>
          </View>
        )}

        {/* Budget Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.budgetInput}
              placeholder="Rp 0"  
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={budget ? `Rp ${budget}` : ''} 
              onChangeText={(text) => {
                const cleaned = text.replace('Rp', '').trim();
                setBudget(formatNumber(cleaned));
              }}
            />
          </View>
          <Text style={styles.inputLabel}>
            {currentBudget > 0
              ? `Update your budget for ${getCurrentMonthYear()}`
              : `Enter your monthly budget for ${getCurrentMonthYear()}`
            }
          </Text>
        </View>

        {/* Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          {suggestions.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.suggestionChip,
                budget === formatNumber(amount.toString()) && styles.suggestionChipActive
              ]}
              onPress={() => setBudget(formatNumber(amount.toString()))}
            >
              <Text style={[
                styles.suggestionText,
                budget === formatNumber(amount.toString()) && styles.suggestionTextActive
              ]}>
                {amount.toLocaleString('id-ID')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Budget Preview */}
        {budget && parseInt(budget.replace(/\./g, '')) > 0 && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Daily Budget Estimation</Text>
            <Text style={styles.previewAmount}>Rp {dailyBudget.toLocaleString('id-ID')}</Text>
            <Text style={styles.previewDesc}>
              Your daily spending limit will be approximately this amount, based on a 30-day month.
            </Text>
          </View>
        )}
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.saveButtonText}>
              {currentBudget > 0 ? 'Update Budget' : 'Save Budget'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 40,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  currentBudgetCard: {
    backgroundColor: Colors.primaryLight,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  currentBudgetLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  currentBudgetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  currentBudgetHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  inputSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyPrefix: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  budgetInput: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 200,
    padding: 0,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  suggestionChip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionChipActive: {
    backgroundColor: Colors.primary,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  suggestionTextActive: {
    color: Colors.surface,
  },
  previewCard: {
    marginTop: 24,
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  previewAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  previewDesc: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 18,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.background,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
});