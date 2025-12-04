// src/screens/main/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import authService from '../../services/authService';

// Definisi Warna
const COLORS = {
  primarySolid: '#00A99D', 
  background: '#F4F6F8',
  card: '#FFFFFF',
  textPrimary: '#2D3748',
  textSecondary: '#718096',
  danger: '#E53E3E',
  white: '#FFFFFF',
  primaryIconBg: 'rgba(0, 169, 157, 0.1)', 
  primaryIconText: '#00A99D',
  border: '#E2E8F0'
};

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    photoURL: null
  });
  const [loading, setLoading] = useState(true);

  // Load user data saat component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        setUserData({
          displayName: currentUser.displayName || 'User',
          email: currentUser.email || 'No email',
          photoURL: currentUser.photoURL
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await authService.signOut();
              
              if (result.success) {
                // Navigasi ke Halaman Login & Hapus History
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                Alert.alert("Error", result.error || "Failed to logout");
              }
              
            } catch (error) {
              Alert.alert("Error", "Failed to logout: " + error.message);
            }
          }
        }
      ]
    );
  };

  // Get initial dari display name
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // Komponen Menu Item
  const MenuItem = ({ icon, title, subtitle, isLast, onPress }) => (
    <TouchableOpacity 
      style={styles.menuItemContainer} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={icon} size={24} color={COLORS.primaryIconText} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.menuSubtitle} numberOfLines={2}>{subtitle}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      {!isLast && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primarySolid} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primarySolid} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER SECTION */}
        <View style={styles.headerContainer}>
          <View style={styles.profileInfo}>
            {/* Avatar - bisa pakai foto atau initial */}
            <View style={styles.avatarContainer}>
              {userData.photoURL ? (
                <Image 
                  source={{ uri: userData.photoURL }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitial(userData.displayName)}
                </Text>
              )}
            </View>
            
            {/* Name & Email */}
            <View style={styles.nameContainer}>
              <Text style={styles.nameText} numberOfLines={1}>
                {userData.displayName}
              </Text>
              <Text style={styles.emailText} numberOfLines={1}>
                {userData.email}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editButton} 
            activeOpacity={0.8}
            onPress={() => Alert.alert('Coming Soon', 'Edit profile feature will be available soon!')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT SECTION */}
        <View style={styles.contentContainer}>
          
          <Text style={styles.sectionHeader}>Budget & Categories</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="account-balance-wallet" 
              title="Set Budget" 
              subtitle="Define your monthly spending limits"
              onPress={() => navigation.navigate('SetBudget')}
            />
            <MenuItem 
              icon="label" 
              title="Manage Categories" 
              subtitle="Customize your expense categories" 
              isLast={true}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
          </View>

          <Text style={styles.sectionHeader}>Reports & Analytics</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="bar-chart" 
              title="Spending Reports" 
              subtitle="View your expenses over time"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <MenuItem 
              icon="insights" 
              title="Financial Insights" 
              subtitle="Get smart suggestions and trends"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <MenuItem 
              icon="file-download" 
              title="Export Data" 
              subtitle="Download your transaction history" 
              isLast={true}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
          </View>

          <Text style={styles.sectionHeader}>Settings</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="notifications" 
              title="Notifications" 
              subtitle="Manage your alerts and reminders"
              onPress={() => navigation.navigate('Notifications')}
            />
            <MenuItem 
              icon="attach-money" 
              title="Currency" 
              subtitle="Set your default currency (IDR)"
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
            <MenuItem 
              icon="nights-stay" 
              title="Appearance" 
              subtitle="Switch between light and dark mode" 
              isLast={true}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            />
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.7}
              onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
            >
              <Text style={[styles.actionText, { color: COLORS.danger }]}>Change Password</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.danger} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { marginTop: 12 }]} 
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <Text style={[styles.actionText, { color: COLORS.danger }]}>Logout</Text>
              <MaterialIcons name="logout" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

        </View>
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primarySolid, 
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primaryIconText,
  },
  nameContainer: { 
    flex: 1, 
    justifyContent: 'center',
    paddingRight: 8,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  emailText: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.9)',
  },
  editButton: {
    backgroundColor: COLORS.white,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  contentContainer: { flex: 1, marginTop: 0 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 72,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryIconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: { flex: 1, justifyContent: 'center' },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: 80,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  actionsContainer: { marginTop: 24, paddingHorizontal: 16 },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: { fontSize: 16, fontWeight: '500' }
});