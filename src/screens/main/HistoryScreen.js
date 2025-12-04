// src/screens/main/HistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import firestoreService from '../../services/firestoreService';
import Colors from '../../constants/Colors';

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    transactionCount: 0,
    startDate: null,
    endDate: null
  });

  const filters = ['All', 'Today', 'Yesterday', 'This Week', 'This Month', 'food', 'shopping', 'transport', 'entertainment', 'health', 'bills'];

  useEffect(() => {
    if (user?.uid) {
      loadHistoryData();
    }
  }, [user]);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedFilter('All');
      setSearchQuery('');
      if (user?.uid) {
        loadHistoryData();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  // Reload when filter or search changes
  useEffect(() => {
    if (user?.uid && !loading) {
      loadHistoryData();
    }
  }, [selectedFilter, searchQuery]);

  const loadHistoryData = async () => {
    try {
      setLoading(true);

      const filters = {
        category: selectedFilter,
        searchQuery: searchQuery.trim()
      };

      const [expensesData, summaryData] = await Promise.all([
        firestoreService.getAllExpenses(user.uid, filters),
        firestoreService.getHistorySummary(user.uid, filters)
      ]);

      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistoryData();
    setRefreshing(false);
  };

  // Group expenses by date
  const groupExpensesByDate = () => {
    const grouped = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseDateOnly = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());

      let key;
      if (expenseDateOnly.getTime() === today.getTime()) {
        key = 'TODAY';
      } else if (expenseDateOnly.getTime() === yesterday.getTime()) {
        key = 'YESTERDAY';
      } else {
        key = expenseDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
      }

      if (!grouped[key]) {
        grouped[key] = {
          total: 0,
          items: []
        };
      }

      grouped[key].total += expense.amount;
      grouped[key].items.push(expense);
    });

    return grouped;
  };

  // Get category style
  const getCategoryStyle = (category) => {
    const styles = {
      'food': { icon: 'fast-food', color: '#FEE2E2', iconColor: '#FF6B6B' },
      'transport': { icon: 'train', color: '#DBEAFE', iconColor: '#4D9FFF' },
      'shopping': { icon: 'cart', color: '#FEF3C7', iconColor: '#FFB84D' },
      'entertainment': { icon: 'game-controller', color: '#F3E5F5', iconColor: '#9B59B6' },
      'health': { icon: 'fitness', color: '#E8F5E9', iconColor: '#4CAF50' },
      'bills': { icon: 'document-text', color: '#F5F5F5', iconColor: '#757575' },
      'others': { icon: 'ellipsis-horizontal-circle', color: '#E0F2F1', iconColor: Colors.primary },
    };
    return styles[category?.toLowerCase()] || styles['others'];
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date range
  const formatDateRange = () => {
    if (!summary.startDate || !summary.endDate) return '-';

    // Check if filtering by special categories
    if (selectedFilter === 'Today') {
      return 'Today';
    } else if (selectedFilter === 'Yesterday') {
      return 'Yesterday';
    } else if (selectedFilter === 'This Week') {
      return 'This Week';
    } else if (selectedFilter === 'This Month') {
      const now = new Date();
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const start = new Date(summary.startDate);
    const end = new Date(summary.endDate);

    return `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // Format filter label
  const formatFilterLabel = (filter) => {
    if (filter === 'All' || filter === 'This Month') return filter;
    return filter.charAt(0).toUpperCase() + filter.slice(1);
  };

  const groupedExpenses = groupExpensesByDate();

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textTertiary }}>Loading history...</Text>
      </View>
    );
  }

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
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
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
                {formatFilterLabel(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL SPENT</Text>
          <Text style={styles.summaryAmount}>Rp {summary.totalSpent.toLocaleString('id-ID')}</Text>
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryPeriod}>{formatDateRange()}</Text>
            <Text style={styles.summaryTransactions}>
              {summary.transactionCount} {summary.transactionCount === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>

        {/* Transaction List */}
        {Object.keys(groupedExpenses).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedFilter !== 'All'
                ? 'Try adjusting your filters or search query'
                : 'Start tracking your expenses to see them here'}
            </Text>
          </View>
        ) : (
          Object.entries(groupedExpenses).map(([date, data]) => (
            <View key={date} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{date}</Text>
                <Text style={styles.sectionTotal}>- Rp {data.total.toLocaleString('id-ID')}</Text>
              </View>

              {data.items.map((item) => {
                const categoryStyle = getCategoryStyle(item.category);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.transactionItem}
                    onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: categoryStyle.color }]}>
                      <Ionicons name={categoryStyle.icon} size={20} color={categoryStyle.iconColor} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionAmount}>- Rp {item.amount.toLocaleString('id-ID')}</Text>
                      <View style={styles.transactionMeta}>
                        <Ionicons name="location-sharp" size={10} color={Colors.danger} style={{ marginRight: 2 }} />
                        <Text style={styles.transactionLocation}>
                          {item.locationName || formatFilterLabel(item.category)}
                        </Text>
                        <Text style={styles.transDot}> • </Text>
                        <Text style={styles.transactionTime}>{formatTime(item.date)}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
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