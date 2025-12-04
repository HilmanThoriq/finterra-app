import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FirestoreService {
  // ========== BUDGET FUNCTIONS ==========

  // Set or Update Monthly Budget
  async setMonthlyBudget(userId, amount) {
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await setDoc(doc(db, 'budgets', userId), {
        amount: amount,
        month: currentMonth,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Budget saved successfully!'
      };
    } catch (error) {
      console.error('Error setting budget:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Monthly Budget
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

  // ========== GET EXPENSE DETAIL ==========
  async getExpenseById(expenseId) {
    try {
      const expenseDoc = await getDoc(doc(db, 'expenses', expenseId));

      if (expenseDoc.exists()) {
        const data = expenseDoc.data();
        return {
          success: true,
          expense: {
            id: expenseDoc.id,
            ...data,
            date: data.date?.toDate()
          }
        };
      } else {
        return {
          success: false,
          error: 'Expense not found'
        };
      }
    } catch (error) {
      console.error('Error getting expense:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========== UPDATE EXPENSE ==========
  async updateExpense(expenseId, expenseData) {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);

      const updateData = {
        amount: expenseData.amount,
        category: expenseData.category,
        locationName: expenseData.locationName || '',
        location: expenseData.location ? {
          latitude: expenseData.location.latitude,
          longitude: expenseData.location.longitude
        } : null,
        note: expenseData.note || '',
        date: Timestamp.fromDate(expenseData.date),
        updatedAt: Timestamp.now()
      };

      await updateDoc(expenseRef, updateData);

      return {
        success: true,
        message: 'Expense updated successfully!'
      };
    } catch (error) {
      console.error('Error updating expense:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========== DELETE EXPENSE ==========
  async deleteExpense(expenseId) {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));

      return {
        success: true,
        message: 'Expense deleted successfully!'
      };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========== HISTORY FUNCTIONS ==========

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

      expenses.sort((a, b) => b.date - a.date);

      // Apply filters
      if (filters.category && filters.category !== 'All') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // NEW: Today filter
        if (filters.category === 'Today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          expenses = expenses.filter(exp => exp.date >= today && exp.date < tomorrow);
        }
        // NEW: Yesterday filter
        else if (filters.category === 'Yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          expenses = expenses.filter(exp => exp.date >= yesterday && exp.date < today);
        }
        // NEW: This Week filter
        else if (filters.category === 'This Week') {
          const startOfWeek = new Date(today);
          const day = startOfWeek.getDay();
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
          startOfWeek.setDate(diff);
          expenses = expenses.filter(exp => exp.date >= startOfWeek);
        }
        // Existing: This Month filter
        else if (filters.category === 'This Month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          expenses = expenses.filter(exp => exp.date >= startOfMonth);
        }
        // Prev Month filter
        else if (filters.category === 'Prev Month') {
          const now = new Date();
          const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          expenses = expenses.filter(exp => exp.date >= startOfPrevMonth && exp.date <= endOfPrevMonth);
        }
        // Category filter
        else {
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

  async getHistorySummary(userId, filters = {}) {
    try {
      const expenses = await this.getAllExpenses(userId, filters);

      const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const transactionCount = expenses.length;

      let startDate = null;
      let endDate = null;

      if (expenses.length > 0) {
        endDate = expenses[0].date;
        startDate = expenses[expenses.length - 1].date;
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