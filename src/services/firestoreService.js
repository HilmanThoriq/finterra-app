import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FirestoreService {
  // Get user's monthly budget
  async getMonthlyBudget(userId) {
    try {
      const budgetDoc = await getDoc(doc(db, 'budgets', userId));
      
      if (budgetDoc.exists()) {
        const data = budgetDoc.data();
        const now = new Date();
        const budgetMonth = data.month; // Format: "2025-11"
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // Check if budget is for current month
        if (budgetMonth === currentMonth) {
          return data.amount || 0;
        }
      }
      return 0; // No budget set for current month
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
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfMonth)),
        where('date', '<=', Timestamp.fromDate(endOfMonth))
      );

      const snapshot = await getDocs(q);
      let total = 0;
      
      snapshot.forEach((doc) => {
        total += doc.data().amount || 0;
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
      const categoryTotals = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category || 'Others';
        categoryTotals[category] = (categoryTotals[category] || 0) + (data.amount || 0);
      });

      if (Object.keys(categoryTotals).length === 0) {
        return { name: null, amount: 0 };
      }

      const topCategory = Object.entries(categoryTotals).reduce((max, [cat, amt]) => 
        amt > max.amount ? { name: cat, amount: amt } : max
      , { name: null, amount: 0 });

      return topCategory;
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
      const daysInMonth = now.getDate(); // Current day of month

      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfMonth))
      );

      const snapshot = await getDocs(q);
      let total = 0;

      snapshot.forEach((doc) => {
        total += doc.data().amount || 0;
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
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const transactions = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() // Convert Firestore Timestamp to JS Date
        });
      });

      return transactions;
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  // Get all home data in one call (optimized)
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
