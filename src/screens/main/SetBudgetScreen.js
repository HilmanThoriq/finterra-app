// src/screens/main/SetBudgetScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function SetBudgetScreen({ navigation }) {
  const [budget, setBudget] = useState('');
  const suggestions = [500000, 1000000, 1500000, 2000000, 5000000];

  const dailyBudget = budget ? Math.floor(parseInt(budget.replace(/\./g, '')) / 30) : 0;

  const handleSave = () => {
    if (!budget || parseInt(budget.replace(/\./g, '')) === 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }
    // TODO: Save to Firestore
    navigation.goBack();
  };

  const formatNumber = (text) => {
    const number = text.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getCurrentMonthYear = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

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
        {/* Budget Input */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={budget}
              onChangeText={(text) => setBudget(formatNumber(text))}
            />
          </View>
          <Text style={styles.inputLabel}>
            Enter your monthly budget in {getCurrentMonthYear()}
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
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Daily Budget Estimation</Text>
          <Text style={styles.previewAmount}>Rp {dailyBudget.toLocaleString('id-ID')}</Text>
          <Text style={styles.previewDesc}>
            Your daily spending limit will be approximately this amount, based on a 30-day month.
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
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
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    color: Colors.surface,
  },
  suggestionTextActive: {
    color: Colors.surface,
  },
  previewCard: {
    marginTop: 32,
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },
});