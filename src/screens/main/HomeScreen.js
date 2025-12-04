// src/screens/main/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import firestoreService from '../../services/firestoreService';
import Colors from '../../constants/Colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [topCategory, setTopCategory] = useState({ name: null, amount: 0 });
  const [dailyAvg, setDailyAvg] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Load data on mount
  useEffect(() => {
    if (user?.uid) {
      loadHomeData();
    }
  }, [user]);

  // Focus listener - reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.uid) {
        loadHomeData();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getHomeData(user.uid);
      
      setMonthlyBudget(data.monthlyBudget);
      setTotalSpent(data.totalSpent);
      setTransactions(data.totalTransactions);
      setTopCategory(data.topCategory);
      setDailyAvg(data.dailyAvg);
      setRecentTransactions(data.recentTransactions);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  // Calculate remaining and percentage
  const remaining = monthlyBudget - totalSpent;
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) : 0;

  // Format date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get category icon and color - FIXED to match database structure
  const getCategoryStyle = (category) => {
    const styles = {
      'food': { icon: 'fast-food', color: '#FEE2E2', iconColor: '#FF6B6B', label: 'Food' },
      'transport': { icon: 'train', color: '#DBEAFE', iconColor: '#4D9FFF', label: 'Transport' },
      'shopping': { icon: 'cart', color:'#FEF3C7', iconColor: '#FFB84D', label: 'Shopping' },
      'entertainment': { icon: 'game-controller', color: '#F3E5F5', iconColor: '#9B59B6', label: 'Entertainment' },
      'health': { icon: 'fitness', color: '#E8F5E9', iconColor: '#4CAF50', label: 'Health' },
      'bills': { icon: 'document-text', color: '#F5F5F5', iconColor: '#757575', label: 'Bills' },
      'others': { icon: 'ellipsis-horizontal-circle', color: '#E0F2F1', iconColor: Colors.primary, label: 'Others' },
    };
    return styles[category?.toLowerCase()] || styles['others'];
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const expenseDate = new Date(date);
    const diffTime = now - expenseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return expenseDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return expenseDate.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  // Format category name for display
  const formatCategoryName = (categoryId) => {
    if (!categoryId) return 'No data';
    const categoryStyle = getCategoryStyle(categoryId);
    return categoryStyle.label;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textTertiary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.displayName || 'User'}!</Text>
            <Text style={styles.date}>{getCurrentDate()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Monthly Budget Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>MONTHLY BUDGET</Text>
            {monthlyBudget === 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('SetBudget')}>
                <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: 'bold' }}>
                  Set Budget
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.budgetAmount}>Rp {monthlyBudget.toLocaleString('id-ID')}</Text>
          <Text style={styles.budgetRemaining}>
            Remaining: {monthlyBudget === 0 ? '~' : `Rp ${remaining.toLocaleString('id-ID')}`}
          </Text>
          
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${Math.min(percentage * 100, 100)}%` }]} />
          </View>
          
          {percentage > 0.7 && monthlyBudget > 0 && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.warningText}>Almost at your limit</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.statValue}>
              {totalSpent === 0 ? 'Rp 0' : `Rp ${totalSpent.toLocaleString('id-ID')}`}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="bag-handle" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.statValue}>{transactions}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="pie-chart" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={[styles.statValue, { fontSize: topCategory.name ? 14 : 16 }]}>
              {formatCategoryName(topCategory.name)}
            </Text>
            <Text style={styles.statLabel}>Top Category</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.statValue}>
              {dailyAvg === 0 ? 'Rp 0' : `Rp ${dailyAvg.toLocaleString('id-ID')}`}
            </Text>
            <Text style={styles.statLabel}>Daily Average</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {recentTransactions.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No expenses recorded yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your spending by adding an expense</Text>
            </View>
          ) : (
            recentTransactions.map((item) => {
              const categoryStyle = getCategoryStyle(item.category);
              return (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.transactionItem}
                  onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
                >
                  <View style={[styles.transIconBox, { backgroundColor: categoryStyle.color }]}>
                    <Ionicons name={categoryStyle.icon} size={20} color={categoryStyle.iconColor} />
                  </View>
                  
                  <View style={styles.transInfo}>
                    <Text style={styles.transAmount}>-Rp {item.amount.toLocaleString('id-ID')}</Text>
                    <View style={styles.transMeta}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location-sharp" size={10} color={Colors.danger} style={{ marginRight: 2 }} />
                        <Text style={styles.transLocation}>
                          {item.locationName || categoryStyle.label}
                        </Text>
                      </View>
                      <Text style={styles.transDot}> • </Text>
                      <Text style={styles.transTime}>{formatTime(item.date)}</Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32, 
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  budgetCard: {
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  setBudgetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    alignSelf: 'center',
  },
  setBudgetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  budgetRemaining: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentSection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 18,
  },
  emptyText: {
    fontSize: 16,
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
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  transIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transInfo: {
    flex: 1,
  },
  transAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  transMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  transDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});