// src/screens/main/MapScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import firestoreService from '../../services/firestoreService';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = 180;
const SHEET_MID_HEIGHT = 240;
const SHEET_MAX_HEIGHT = height * 0.65;

export default function MapScreen({ navigation, route }) {
  const { user } = useAuth();
  const mapRef = useRef(null);

  // States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Filter options
  const filters = ['All', 'Today', 'Yesterday', 'This Week', 'This Month', 'Prev Month'];

  // Animated value for sheet height
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
  const [currentSheetHeight, setCurrentSheetHeight] = useState(SHEET_MIN_HEIGHT);
  const [allowMaxHeight, setAllowMaxHeight] = useState(false);
  const [showMid, setShowMid] = useState(false);
  const [showMax, setShowMax] = useState(false);
  const prevValueRef = useRef(SHEET_MIN_HEIGHT);

  // Load data
  useEffect(() => {
    if (user?.uid) {
      loadExpenses();
    }
    getCurrentLocation();
  }, [user]);

  // Reload when filter changes
  useEffect(() => {
    if (user?.uid && !loading) {
      loadExpenses();
    }
  }, [selectedFilter, searchQuery]);

  // Handle navigation params (when coming from ExpenseDetail)
  useEffect(() => {
    if (route.params?.lat && route.params?.lng) {
      const { lat, lng } = route.params;

      // Wait for map to be ready
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      }, 500);
    }
  }, [route.params]);

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const filters = {
        category: selectedFilter,
        searchQuery: searchQuery.trim()
      };

      const expensesData = await firestoreService.getAllExpenses(user.uid, filters);

      // Filter only expenses with location
      const expensesWithLocation = expensesData.filter(exp => exp.location);

      setExpenses(expensesWithLocation);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  // Get category style
  const getCategoryStyle = (category) => {
    const styles = {
      'food': { icon: 'fast-food', color: '#FF6B6B' },
      'transport': { icon: 'train', color: '#4D9FFF' },
      'shopping': { icon: 'cart', color: '#FFB84D' },
      'entertainment': { icon: 'game-controller', color: '#9B59B6' },
      'health': { icon: 'fitness', color: '#4CAF50' },
      'bills': { icon: 'document-text', color: '#757575' },
      'others': { icon: 'ellipsis-horizontal-circle', color: Colors.primary },
    };
    return styles[category?.toLowerCase()] || styles['others'];
  };

  // Format datetime
  const formatDateTime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format filter label
  const formatFilterLabel = (filter) => {
    return filter;
  };

  // Listener for sheet height
  useEffect(() => {
    const id = sheetHeight.addListener(({ value }) => {
      const prev = prevValueRef.current;

      if (value >= SHEET_MID_HEIGHT && prev < SHEET_MID_HEIGHT) {
        setShowMid(true);
      } else if (value < SHEET_MID_HEIGHT && prev >= SHEET_MID_HEIGHT) {
        setShowMid(false);
      }

      if (value >= SHEET_MAX_HEIGHT && prev < SHEET_MAX_HEIGHT) {
        setShowMax(true);
      } else if (value < SHEET_MAX_HEIGHT && prev >= SHEET_MAX_HEIGHT) {
        setShowMax(false);
      }

      prevValueRef.current = value;
    });

    return () => {
      sheetHeight.removeListener(id);
    };
  }, []);

  const animateTo = (toValue) => {
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      bounciness: 0,
    }).start(() => {
      setCurrentSheetHeight(toValue);
      prevValueRef.current = toValue;
      setShowMid(toValue >= SHEET_MID_HEIGHT);
      setShowMax(toValue >= SHEET_MAX_HEIGHT);
    });
  };

  // Check Nearby handler
  const handleCheckNearby = () => {
    setAllowMaxHeight(true);
    setNearbyPlaces([
      { id: 1, name: 'Pacific Place', distance: '150m', type: 'Shopping Mall' },
      { id: 2, name: 'Plaza Senayan', distance: '1.2km', type: 'Shopping Mall' },
      { id: 3, name: 'Grand Indonesia', distance: '300m', type: 'Shopping Mall' },
    ]);

    animateTo(SHEET_MAX_HEIGHT);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const candidateHeight = currentSheetHeight - gestureState.dy;
        const clamped = Math.max(SHEET_MIN_HEIGHT, Math.min(candidateHeight, SHEET_MID_HEIGHT));
        sheetHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const candidateHeight = currentSheetHeight - gestureState.dy;
        let target = candidateHeight > SHEET_MIN_HEIGHT + 50 ? SHEET_MID_HEIGHT : SHEET_MIN_HEIGHT;
        animateTo(target);
      },
    })
  ).current;

  const centerMapToUser = () => {
    if (!currentLocation || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 600);
  };

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={currentLocation}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {expenses.map((expense) => {
          const categoryStyle = getCategoryStyle(expense.category);
          return (
            <Marker
              key={expense.id}
              coordinate={{
                latitude: expense.location.latitude,
                longitude: expense.location.longitude
              }}
              pinColor={categoryStyle.color}
            >
              <Callout
                tooltip
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
              >
                <View style={styles.calloutContainer}>
                  <View style={styles.calloutHeader}>
                    <Ionicons name={categoryStyle.icon} size={16} color={categoryStyle.color} />
                    <Text style={styles.calloutCat}>{expense.category.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.calloutAmount}>
                    Rp {expense.amount.toLocaleString('id-ID')}
                  </Text>
                  <Text style={styles.calloutName} numberOfLines={1}>
                    {expense.locationName || 'Unknown Location'}
                  </Text>
                  <Text style={styles.calloutDate}>
                    {formatDateTime(expense.date)}
                  </Text>
                  <View style={styles.calloutButton}>
                    <Text style={styles.calloutLink}>View Detail</Text>
                    <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* SEARCH BAR & GEOLOCATION */}
      <View style={styles.topContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses or places"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* GEOLOCATION BUTTON */}
        <TouchableOpacity style={styles.geoBtn} onPress={centerMapToUser}>
          <Ionicons name="locate" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* FILTER CHIPS */}
      <View style={styles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
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
      </View>

      {/* LOADING INDICATOR */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        </View>
      )}

      {/* DRAGGABLE BOTTOM SHEET */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Location */}
          <View style={styles.locContainer}>
            <View style={styles.locIconBg}>
              <Ionicons name="location" size={24} color={Colors.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locTitle}>Current Location</Text>
              <Text style={styles.locDesc}>
                Jl. Jenderal Sudirman No.Kav. 52-53, Senayan
              </Text>
            </View>
          </View>

          {/* Check Nearby Button */}
          <View
            style={{
              opacity: showMid ? 1 : 0,
              height: showMid ? 'auto' : 0,
              overflow: 'hidden',
            }}
            pointerEvents={showMid ? 'auto' : 'none'}
          >
            <TouchableOpacity style={styles.checkBtn} onPress={handleCheckNearby}>
              <Text style={styles.checkBtnText}>Check Nearby Shopping Areas</Text>
            </TouchableOpacity>
          </View>

          {/* Nearby Places */}
          {showMax && nearbyPlaces.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.nearbyTitle}>Nearby Places</Text>
              {nearbyPlaces.map((place) => (
                <View key={place.id} style={styles.placeItem}>
                  <View style={styles.placeIcon}>
                    <Ionicons name="bag-handle" size={20} color="#374151" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeType}>{place.type}</Text>
                  </View>
                  <Text style={styles.placeDist}>{place.distance}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },

  topContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#1F2937',
    fontSize: 14,
  },

  geoBtn: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },

  // Filter Chips
  filterChipsContainer: {
    position: 'absolute',
    top: 115,
    left: 0,
    right: 0,
  },

  filterChipsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
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

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 170,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  loadingBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
  },

  loadingText: {
    marginLeft: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Callout
  calloutContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 8,
  },

  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  calloutCat: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: 0.5,
  },
  
  calloutAmount: {
    flexDirection: 'row',
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  
  calloutName: {
    flexDirection: 'row',
    fontSize: 14,
    color: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  
  calloutDate: {
    flexDirection: 'row',
    fontSize: 11,
    color: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  calloutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },

  calloutLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: 'bold',
    marginRight: 4,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    elevation: 10,
  },

  dragHandleArea: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },

  locContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  locIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  locTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.textPrimary,
  },

  locDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
  },

  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  checkBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  checkBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  nearbyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },

  placeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  placeName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  placeType: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  placeDist: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
});