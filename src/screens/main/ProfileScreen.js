// src/screens/main/ProfileScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// Import Firebase Auth
import { getAuth, signOut } from 'firebase/auth'; 

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
              // 1. Proses Logout Firebase
              const auth = getAuth();
              await signOut(auth);

              // 2. Navigasi ke Halaman Login & Hapus History
              // Menggunakan 'reset' agar user tidak bisa tekan tombol back ke profile
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }], // <--- Pastikan nama ini sesuai dengan Stack Navigator Anda
              });
              
            } catch (error) {
              Alert.alert("Error", "Gagal logout: " + error.message);
            }
          }
        }
      ]
    );
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
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>S</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>Sarah Johnson</Text>
              <Text style={styles.emailText}>sarah.johnson@email.com</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT SECTION */}
        <View style={styles.contentContainer}>
          
          <Text style={styles.sectionHeader}>Budget & Categories</Text>
          <View style={styles.card}>
            <MenuItem icon="account-balance-wallet" title="Set Budget" subtitle="Define your monthly spending limits" />
            <MenuItem icon="label" title="Manage Categories" subtitle="Customize your expense categories" isLast={true} />
          </View>

          <Text style={styles.sectionHeader}>Reports & Analytics</Text>
          <View style={styles.card}>
            <MenuItem icon="bar-chart" title="Spending Reports" subtitle="View your expenses over time" />
            <MenuItem icon="insights" title="Financial Insights" subtitle="Get smart suggestions and trends" />
            <MenuItem icon="file-download" title="Export Data" subtitle="Download your transaction history" isLast={true} />
          </View>

          <Text style={styles.sectionHeader}>Settings</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="notifications" 
              title="Notifications" 
              subtitle="Manage your alerts and reminders"
              onPress={() => navigation.navigate('Notifications')} 
            />
            <MenuItem icon="attach-money" title="Currency" subtitle="Set your default currency (IDR)" />
            <MenuItem icon="nights-stay" title="Appearance" subtitle="Switch between light and dark mode" isLast={true} />
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard} activeOpacity={0.7}>
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
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primaryIconText,
  },
  nameContainer: { flex: 1, justifyContent: 'center' },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  emailText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)' },
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