// src/screens/main/HistoryScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function HistoryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'This Month', 'Food', 'Shopping', 'Transport', '+ More'];

  const transactions = {
    TODAY: {
      total: 125000,
      items: [
        { id: 1, name: 'Kopi Kenangan', location: 'Grand Indonesia', time: '08:15', amount: 25000, icon: 'fast-food', category: 'Food', iconBg: '#FEE2E2', iconColor: '#FF6B6B' },
        { id: 2, name: 'Gojek', location: 'Office - Home', time: '17:30', amount: 50000, icon: 'train', category: 'Transport', iconBg: '#DBEAFE', iconColor: '#4D9FFF' },
        { id: 3, name: 'Tokopedia', location: 'Online', time: '19:45', amount: 50000, icon: 'cart', category: 'Shopping', iconBg: '#FEF3C7', iconColor: '#FFB84D' },
      ]
    },
    YESTERDAY: {
      total: 250000,
      items: [
        { id: 4, name: 'Warung Nasi Padang', location: 'Blok M', time: '12:30', amount: 35000, icon: 'fast-food', category: 'Food', iconBg: '#FEE2E2', iconColor: '#FF6B6B' },
        { id: 5, name: 'Cinema XXI', location: 'Plaza Senayan', time: '20:00', amount: 100000, icon: 'game-controller', category: 'Entertainment', iconBg: '#F3E5F5', iconColor: '#9B59B6' },
      ]
    },
    '14 NOV': {
      total: 80000,
      items: [
        { id: 6, name: 'MRT Jakarta', location: 'Istora Mandiri', time: '08:00', amount: 15000, icon: 'train', category: 'Transport', iconBg: '#DBEAFE', iconColor: '#4D9FFF' },
      ]
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>Your spending overview</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL SPENT</Text>
          <Text style={styles.summaryAmount}>Rp 1.450.000</Text>
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryPeriod}>1 Nov - 16 Nov 2025</Text>
            <Text style={styles.summaryTransactions}>23 transactions</Text>
          </View>
        </View>

        {/* Transaction List */}
        {Object.entries(transactions).map(([date, data]) => (
          <View key={date} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{date}</Text>
              <Text style={styles.sectionTotal}>- Rp {data.total.toLocaleString('id-ID')}</Text>
            </View>

            {data.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.transactionItem}
                onPress={() => navigation.navigate('ExpenseDetail', { id: item.id })}
              >
                <View style={[styles.transactionIcon, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionAmount}>- Rp {item.amount.toLocaleString('id-ID')}</Text>
                  <View style={styles.transactionMeta}>
                    <Ionicons name="location-sharp" size={10} color={Colors.danger} style={{ marginRight: 2 }} />
                    <Text style={styles.transactionLocation}>{item.location}</Text>
                    <Text style={styles.transDot}> • </Text>
                    <Text style={styles.transactionTime}>{item.time}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterTextActive: {
    color: Colors.surface,
  },
  summaryCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 8,
  },
  summaryFooter: {
    marginTop: 8,
  },
  summaryPeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  summaryTransactions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.danger,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transDot: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});