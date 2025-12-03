import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FirestoreService {
  // ========== ADD EXPENSE ==========
  async addExpense(userId, expenseData) {
    try {
      const expense = {
        userId,
        amount: expenseData.amount,
        category: expenseData.category,
        locationName: expenseData.locationName || '',
        location: expenseData.location ? {
          latitude: expenseData.location.latitude,
          longitude: expenseData.location.longitude
        } : null,
        note: expenseData.note || '',
        date: Timestamp.fromDate(expenseData.date),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'expenses'), expense);
      
      return {
        success: true,
        id: docRef.id,
        message: 'Expense added successfully!'
      };
    } catch (error) {
      console.error('Error adding expense:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========== HISTORY FUNCTIONS ==========
  
  // Get all expenses for history page
  async getAllExpenses(userId, filters = {}) {
    try {
      let q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      let expenses = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate()
        });
      });

      // Sort by date (newest first)
      expenses.sort((a, b) => b.date - a.date);

      // Apply filters in memory
      if (filters.category && filters.category !== 'All') {
        if (filters.category === 'This Month') {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          expenses = expenses.filter(exp => exp.date >= startOfMonth);
        } else {
          expenses = expenses.filter(exp => exp.category === filters.category.toLowerCase());
        }
      }

      // Apply search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        expenses = expenses.filter(exp => 
          (exp.locationName?.toLowerCase().includes(query)) ||
          (exp.note?.toLowerCase().includes(query)) ||
          (exp.category?.toLowerCase().includes(query))
        );
      }

      return expenses;
    } catch (error) {
      console.error('Error getting all expenses:', error);
      return [];
    }
  }

  // Get history summary (total spent and count for filtered period)
  async getHistorySummary(userId, filters = {}) {
    try {
      const expenses = await this.getAllExpenses(userId, filters);
      
      const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const transactionCount = expenses.length;

      // Get date range
      let startDate = null;
      let endDate = null;
      
      if (expenses.length > 0) {
        endDate = expenses[0].date; // Newest
        startDate = expenses[expenses.length - 1].date; // Oldest
      }

      return {
        totalSpent,
        transactionCount,
        startDate,
        endDate
      };
    } catch (error) {
      console.error('Error getting history summary:', error);
      return {
        totalSpent: 0,
        transactionCount: 0,
        startDate: null,
        endDate: null
      };
    }
  }

  // ========== HOME FUNCTIONS ==========
  
  // Get user's monthly budget
  async getMonthlyBudget(userId) {
    try {
      const budgetDoc = await getDoc(doc(db, 'budgets', userId));
      
      if (budgetDoc.exists()) {
        const data = budgetDoc.data();
        const now = new Date();
        const budgetMonth = data.month;
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        if (budgetMonth === currentMonth) {
          return data.amount || 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error getting budget:', error);
      return 0;
    }
  }

  // Get total spent for current month
  async getTotalSpent(userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      let total = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const expenseDate = data.date?.toDate();
        
        if (expenseDate && expenseDate >= startOfMonth && expenseDate <= endOfMonth) {
          total += data.amount || 0;
        }
      });

      return total;
    } catch (error) {
      console.error('Error getting total spent:', error);
      return 0;
    }
  }

  // Get total transactions count (all time)
  async getTotalTransactions(userId) {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting transactions count:', error);
      return 0;
    }
  }

  // Get top category
  async getTopCategory(userId) {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const categoryData = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category || 'others';
        
        if (!categoryData[category]) {
          categoryData[category] = {
            count: 0,
            totalAmount: 0
          };
        }
        
        categoryData[category].count += 1;
        categoryData[category].totalAmount += (data.amount || 0);
      });

      if (Object.keys(categoryData).length === 0) {
        return { name: null, amount: 0 };
      }

      const maxCount = Math.max(...Object.values(categoryData).map(d => d.count));
      const topCategories = Object.entries(categoryData)
        .filter(([_, data]) => data.count === maxCount);
      
      const topCategory = topCategories.reduce((max, [cat, data]) => 
        data.totalAmount > max.totalAmount 
          ? { name: cat, amount: data.totalAmount, count: data.count } 
          : max
      , { name: topCategories[0][0], amount: topCategories[0][1].totalAmount, count: maxCount });

      return { name: topCategory.name, amount: topCategory.amount };
    } catch (error) {
      console.error('Error getting top category:', error);
      return { name: null, amount: 0 };
    }
  }

  // Get daily average
  async getDailyAverage(userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = now.getDate();

      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      let total = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const expenseDate = data.date?.toDate();
        
        if (expenseDate && expenseDate >= startOfMonth) {
          total += data.amount || 0;
        }
      });

      return daysInMonth > 0 ? Math.round(total / daysInMonth) : 0;
    } catch (error) {
      console.error('Error getting daily average:', error);
      return 0;
    }
  }

  // Get recent transactions (last 3)
  async getRecentTransactions(userId) {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const transactions = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate()
        });
      });

      transactions.sort((a, b) => b.date - a.date);
      return transactions.slice(0, 3);
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  // Get all home data in one call
  async getHomeData(userId) {
    try {
      const [
        monthlyBudget,
        totalSpent,
        totalTransactions,
        topCategory,
        dailyAvg,
        recentTransactions
      ] = await Promise.all([
        this.getMonthlyBudget(userId),
        this.getTotalSpent(userId),
        this.getTotalTransactions(userId),
        this.getTopCategory(userId),
        this.getDailyAverage(userId),
        this.getRecentTransactions(userId)
      ]);

      return {
        monthlyBudget,
        totalSpent,
        totalTransactions,
        topCategory,
        dailyAvg,
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting home data:', error);
      return {
        monthlyBudget: 0,
        totalSpent: 0,
        totalTransactions: 0,
        topCategory: { name: null, amount: 0 },
        dailyAvg: 0,
        recentTransactions: []
      };
    }
  }
}

export default new FirestoreService();