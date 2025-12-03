// src/screens/main/ExpenseDetailScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import EditExpenseModal from './EditExpenseModal';

export default function ExpenseDetailScreen({ navigation, route }) {
  const { id } = route.params || {};
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Mock data - replace with actual data from Firestore
  const [expense, setExpense] = useState({
    id: id || '1',
    amount: 85000,
    category: 'food',
    categoryName: 'Food & Drink',
    name: 'Starbucks - Grand Indonesia',
    locationName: 'Starbucks - Grand Indonesia',
    location: {
      latitude: -6.195,
      longitude: 106.823,
    },
    date: '2023-09-25T14:30:00',
    notes: 'Meeting with the team for a quick coffee brainstorming session about the Q4 launch.',
  });

  // Get category color based on category name
  const getCategoryColor = (category) => {
    const categoryColors = {
      'food': Colors.categoryFood,
      'transport': Colors.categoryTransport,
      'shopping': Colors.categoryShopping,
      'entertainment': Colors.categoryEntertainment,
      'health': Colors.categoryHealth,
      'bills': Colors.categoryBills,
      'others': Colors.categoryOthers,
    };
    return categoryColors[category] || Colors.primary;
  };

  const categoryColor = getCategoryColor(expense.category);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleString('en-US', options);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete from Firestore
            console.log('Delete expense:', expense.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleUpdateExpense = (updatedExpense) => {
    // TODO: Update to Firestore
    setExpense(updatedExpense);
    console.log('Updated expense:', updatedExpense);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Ionicons name="create-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color: categoryColor }]}>
            Rp {expense.amount.toLocaleString('id-ID')}
          </Text>
        </View>

        {/* Category Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>{expense.categoryName}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          {/* Location Card with Map */}
          <View style={styles.locationCard}>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: expense.location.latitude,
                  longitude: expense.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: expense.location.latitude,
                    longitude: expense.location.longitude,
                  }}
                  pinColor={categoryColor}
                />
              </MapView>
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{expense.locationName}</Text>
              <Text style={styles.locationCoordinates}>
                {expense.location.latitude.toFixed(4)}, {expense.location.longitude.toFixed(4)}
              </Text>
              <TouchableOpacity 
                style={[styles.viewMapButton, { backgroundColor: categoryColor }]}
                onPress={() => {
                  // TODO: Open external map app or full screen map
                  Alert.alert('Open Map', 'This will open the map application');
                }}
              >
                <Text style={styles.viewMapText}>View on Map</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons name="calendar-outline" size={24} color={categoryColor} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailText}>{formatDateTime(expense.date)}</Text>
            </View>
          </View>

          {/* Notes */}
          {expense.notes && (
            <View style={styles.notesCard}>
              <View style={[styles.detailIcon, { backgroundColor: categoryColor + '20' }]}>
                <Ionicons name="document-text-outline" size={24} color={categoryColor} />
              </View>
              <View style={styles.notesContent}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{expense.notes}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.surface} style={{ marginRight: 8 }} />
          <Text style={styles.deleteButtonText}>Delete Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <EditExpenseModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        expense={expense}
        onUpdate={handleUpdateExpense}
      />
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
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  amountSection: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 4,
  },
  mapContainer: {
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationInfo: {
    padding: 16,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  locationCoordinates: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  viewMapButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  notesContent: {
    flex: 1,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.background,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
});