// src/screens/main/AddExpenseModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Colors from '../../constants/Colors';

export default function AddExpenseModal({ visible, onClose }) {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: -6.200,
    longitude: 106.816,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const categories = [
    { id: 'food', label: 'Food', icon: 'fast-food', color: Colors.categoryFood },
    { id: 'transport', label: 'Transport', icon: 'train', color: Colors.categoryTransport },
    { id: 'shopping', label: 'Shopping', icon: 'cart', color: Colors.categoryShopping },
    { id: 'entertainment', label: 'Entertain', icon: 'game-controller', color: Colors.categoryEntertainment },
    { id: 'health', label: 'Health', icon: 'fitness', color: Colors.categoryHealth },
    { id: 'bills', label: 'Bills', icon: 'document-text', color: Colors.categoryBills },
    { id: 'others', label: 'Others', icon: 'ellipsis-horizontal-circle', color: Colors.categoryOthers },
  ];

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    setCurrentRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleClear = () => {
    setAmount('');
    setSelectedCategory(null);
    setLocationName('');
    setNote('');
    setSelectedLocation(null);
    setDate(new Date());
  };

  const handleSave = () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please fill in amount and select category');
      return;
    }

    // TODO: Save to Firestore
    console.log({
      amount: parseFloat(amount.replace(/\./g, '')),
      category: selectedCategory,
      locationName,
      location: selectedLocation,
      note,
      date,
    });

    onClose();
    handleClear();
  };

  const formatNumber = (text) => {
    const number = text.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const formatDateTime = () => {
    const options = { 
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleString('en-US', options);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
  };

  const confirmLocation = () => {
    setShowMapModal(false);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Expense</Text>
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount */}
              <View style={styles.amountSection}>
                <Text style={styles.currencySymbol}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(text) => setAmount(formatNumber(text))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>

              {/* Categories */}
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionLabel}>Category</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategory === category.id && {
                          backgroundColor: category.color + '20',
                          borderColor: category.color,
                        }
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                        <Ionicons name={category.icon} size={20} color={Colors.surface} />
                      </View>
                      <Text style={styles.categoryLabel}>{category.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabel}>Date & Time</Text>
              </View>
              <TouchableOpacity 
                style={styles.dateTimeSection}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeText}>{formatDateTime()}</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.dateTimeButtons}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={16} color={Colors.primary} />
                  <Text style={styles.dateTimeButtonText}>Change Date</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={16} color={Colors.primary} />
                  <Text style={styles.dateTimeButtonText}>Change Time</Text>
                </TouchableOpacity>
              </View>

              {/* Location */}
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabel}>Location</Text>
              </View>
              <View style={styles.inputSection}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Location name (e.g., Starbucks Central Park)"
                  placeholderTextColor={Colors.textTertiary}
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>

              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => setShowMapModal(true)}
              >
                <Ionicons name="map-outline" size={20} color={Colors.primary} />
                <Text style={styles.mapButtonText}>
                  {selectedLocation ? 'Change Location on Map' : 'Pick Location on Map'}
                </Text>
              </TouchableOpacity>

              {selectedLocation && (
                <View style={styles.selectedLocationInfo}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.selectedLocationText}>
                    Location selected: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </Text>
                </View>
              )}

              {/* Note */}
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabel}>Note (Optional)</Text>
              </View>
              <View style={[styles.inputSection, styles.noteSection]}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} style={{ marginTop: 22 }} />
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  placeholder="Add a note... (e.g., Lunch with client)"
                  placeholderTextColor={Colors.textTertiary}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!amount || !selectedCategory) && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!amount || !selectedCategory}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.surface} />
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.mapHeaderTitle}>Select Location</Text>
            <TouchableOpacity onPress={confirmLocation}>
              <Text style={styles.mapConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.fullMap}
            initialRegion={currentRegion}
            onPress={handleMapPress}
            showsUserLocation
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                pinColor={Colors.primary}
              />
            )}
          </MapView>

          <View style={styles.mapInstruction}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.mapInstructionText}>Tap anywhere on the map to select location</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    minWidth: 200,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  dateTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dateTimeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryOpacity10,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dateTimeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 12,
    minHeight: 24,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  noteInput: {
    minHeight: 60,
    paddingTop: 24,
  },
  noteSection: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryOpacity10,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  selectedLocationText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 26,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  // Map Modal Styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  mapConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  fullMap: {
    flex: 1,
  },
  mapInstruction: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapInstructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});