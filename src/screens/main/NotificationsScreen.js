// src/screens/main/NotificationsScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Konfigurasi warna sesuai HTML/Tailwind Config Anda
const THEME = {
  primary: "#00A99D",        // Teal
  background: "#F7F9F9",     // Off-White
  card: "#FFFFFF",           // White
  textPrimary: "#2D3748",    // Dark Charcoal
  textSecondary: "#718096",  // Grey
  accent: "#FF6B6B",         // Coral
  border: "#E2E8F0",         // Light Gray for borders
  primaryLight: "rgba(0, 169, 157, 0.15)", // Transparansi untuk bg icon
};

export default function NotificationsScreen({ navigation }) {

  // Data Dummy sesuai konten HTML
  const notifications = [
    {
      section: "Today",
      data: [
        {
          id: 1,
          type: 'alert', // Logic untuk warna merah
          icon: 'priority-high',
          title: "Budget Alert",
          body: "You've used 90% of your 'Food' budget.",
          time: "10:45 AM",
          unread: true,
        },
        {
          id: 2,
          type: 'location', // Logic untuk warna teal
          icon: 'location-on',
          title: "Location Reminder",
          body: "You're near Kopi Kenangan. Log your coffee expense?",
          time: "09:30 AM",
          unread: true,
        }
      ]
    },
    {
      section: "Yesterday",
      data: [
        {
          id: 3,
          type: 'report',
          icon: 'bar-chart', // 'monitoring' di material symbols mirip bar-chart/analytics
          title: "Report Ready",
          body: "Your weekly spending report is ready to view.",
          time: "06:15 PM",
          unread: false,
        }
      ]
    },
    {
      section: "Earlier",
      data: [
        {
          id: 4,
          type: 'alert',
          icon: 'priority-high',
          title: "Budget Alert",
          body: "You're nearing your monthly 'Transport' limit.",
          time: "3 days ago",
          unread: false,
        }
      ]
    }
  ];

  const renderIcon = (type, iconName) => {
    // Style dinamis berdasarkan tipe notifikasi
    const isAlert = type === 'alert';
    
    return (
      <View style={[
        styles.iconCircle, 
        { backgroundColor: isAlert ? THEME.accent : THEME.primaryLight }
      ]}>
        <MaterialIcons 
          name={iconName} 
          size={24} 
          color={isAlert ? '#FFFFFF' : THEME.primary} 
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <MaterialIcons name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            
            <View style={styles.listContainer}>
              {section.data.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    {/* Left Icon */}
                    {renderIcon(item.type, item.icon)}

                    {/* Text Content */}
                    <View style={styles.textContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemBody}>{item.body}</Text>
                      <Text style={styles.itemTime}>{item.time}</Text>
                    </View>
                  </View>

                  {/* Unread Indicator (Red Dot) */}
                  <View style={styles.rightIndicator}>
                    {item.unread && <View style={styles.unreadDot} />}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:40,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    width: 40, 
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold', // Pastikan font dimuat, atau gunakan fontWeight: '700'
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  markAllRead: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '700',
    textAlign: 'right',
    width: 100, // Memberikan ruang agar tidak text-wrap
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  listContainer: {
    gap: 8, // Jarak antar kartu (React Native 0.71+)
  },
  card: {
    flexDirection: 'row',
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 16,
    // Shadow style untuk iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Shadow style untuk Android
    elevation: 2,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardContent: {
    flexDirection: 'row',
    flex: 1,
    gap: 16, // Jarak antara icon dan text
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24, // Membuat lingkaran sempurna
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600', // Medium/Semibold
    color: THEME.textPrimary,
  },
  itemBody: {
    fontSize: 14,
    fontWeight: '400',
    color: THEME.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  itemTime: {
    fontSize: 12,
    fontWeight: '400',
    color: THEME.textSecondary,
    marginTop: 4,
  },
  rightIndicator: {
    width: 10,
    alignItems: 'flex-end',
    paddingTop: 6, 
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.accent,
  },
});