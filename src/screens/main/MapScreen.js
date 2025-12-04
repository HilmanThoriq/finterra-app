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
  ActivityIndicator,
  Alert
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Heatmap } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import firestoreService from '../../services/firestoreService';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = 180;
const SHEET_MID_HEIGHT = 240;
const SHEET_MAX_HEIGHT = height * 0.65;

const GOOGLE_PLACES_API_KEY = 'AIzaSyAy6pTdTp8lCD3ehksPfh6C4oYvZ9KIF9U';

export default function MapScreen({ navigation, route }) {
  const { user } = useAuth();
  const mapRef = useRef(null);

  // States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('Getting your location...');
  const [expenses, setExpenses] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [hasSeenHeatmapInfo, setHasSeenHeatmapInfo] = useState(false);

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

  // Handle navigation params
  useEffect(() => {
    if (route.params?.lat && route.params?.lng) {
      const { lat, lng } = route.params;

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

  // Check if heatmap should be shown based on filter
  const shouldShowHeatmap = (filter) => {
    return ['This Week', 'This Month', 'Prev Month'].includes(filter);
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const filters = {
        category: selectedFilter,
        searchQuery: searchQuery.trim()
      };

      const expensesData = await firestoreService.getAllExpenses(user.uid, filters);
      const expensesWithLocation = expensesData.filter(exp => exp.location);

      setExpenses(expensesWithLocation);

      // Generate heatmap data if filter is weekly or monthly
      if (shouldShowHeatmap(selectedFilter)) {
        setShowHeatmap(true);
        generateHeatmapData(expensesWithLocation);
      } else {
        setShowHeatmap(false);
        setHeatmapPoints([]);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (expensesData) => {
    const points = [];
    
    // Group expenses by location (with some tolerance for nearby points)
    const locationGroups = {};
    const tolerance = 0.0001; // approximately 11 meters

    expensesData.forEach(expense => {
      if (!expense.location) return;

      const lat = expense.location.latitude;
      const lng = expense.location.longitude;
      
      // Find if there's a nearby location already grouped
      let foundGroup = false;
      for (let key in locationGroups) {
        const [groupLat, groupLng] = key.split(',').map(Number);
        const distance = Math.sqrt(
          Math.pow(lat - groupLat, 2) + Math.pow(lng - groupLng, 2)
        );
        
        if (distance < tolerance) {
          locationGroups[key].amount += expense.amount;
          locationGroups[key].count += 1;
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        const key = `${lat},${lng}`;
        locationGroups[key] = {
          latitude: lat,
          longitude: lng,
          amount: expense.amount,
          count: 1
        };
      }
    });

    // Find max amount for weight calculation
    const amounts = Object.values(locationGroups).map(g => g.amount);
    const maxAmount = Math.max(...amounts, 1);

    // Convert to heatmap points with weights
    Object.values(locationGroups).forEach(group => {
      // Weight based on total spending at this location
      // Normalize between 0-1, with minimum weight of 0.2 for visibility
      const normalizedWeight = Math.max(0.2, group.amount / maxAmount);
      
      points.push({
        latitude: group.latitude,
        longitude: group.longitude,
        weight: normalizedWeight
      });
    });

    setHeatmapPoints(points);
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;

      setCurrentLocation({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const [streetAddress, placeName] = await Promise.all([
        getReverseGeocode(latitude, longitude),
        getNearestPlaceName(latitude, longitude)
      ]);

      let finalAddress = "";

      if (streetAddress) {
        finalAddress = streetAddress;
      } else {
        finalAddress = "Unknown Location";
      }

      setCurrentAddress(finalAddress);

      await getReverseGeocode(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentAddress('Unable to get location');
    }
  };

  const getReverseGeocode = async (latitude, longitude) => {
    try {
      if (!latitude || !longitude) {
        console.log("Reverse geocode skipped: invalid coords", latitude, longitude);
        return null;
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.log("Reverse geocode error status:", data.status);
        return null;
      }
    } catch (err) {
      console.log("Reverse geocode error:", err);
      return null;
    }
  };

  const getNearestPlaceName = async (latitude, longitude) => {
    try {
      const radius = 50;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=establishment&key=${GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].name;
      }
    } catch (err) {
      console.warn('getNearestPlaceName error:', err);
    }
    return null;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const handleCheckNearby = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Current location not available');
      return;
    }

    setLoadingNearby(true);
    setAllowMaxHeight(true);
    animateTo(SHEET_MAX_HEIGHT);

    try {
      const { latitude, longitude } = currentLocation;
      const radius = 50;

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const placesWithDistance = data.results.map(place => {
          const distance = calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          return {
            id: place.place_id,
            name: place.name,
            type: place.types[0]?.replace(/_/g, ' ') || 'Place',
            distance: distance,
            distanceText: formatDistance(distance),
            location: place.geometry.location,
            address: place.vicinity
          };
        });

        placesWithDistance.sort((a, b) => a.distance - b.distance);
        const top3Places = placesWithDistance.slice(0, 3);

        setNearbyPlaces(top3Places);
      } else if (data.status === 'ZERO_RESULTS') {
        Alert.alert('No Places Found', 'No places found within 50m radius');
        setNearbyPlaces([]);
      } else {
        Alert.alert('Error', `Google Places API error: ${data.status}`);
        setNearbyPlaces([]);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      Alert.alert('Error', 'Failed to fetch nearby places');
      setNearbyPlaces([]);
    } finally {
      setLoadingNearby(false);
    }
  };

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const candidateHeight = currentSheetHeight - gestureState.dy;
        const maxAllowed = allowMaxHeight ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;
        const clamped = Math.max(SHEET_MIN_HEIGHT, Math.min(candidateHeight, maxAllowed));
        sheetHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const candidateHeight = currentSheetHeight - gestureState.dy;
        const maxAllowed = allowMaxHeight ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;

        let target;
        if (allowMaxHeight) {
          if (candidateHeight > SHEET_MID_HEIGHT + 100) {
            target = SHEET_MAX_HEIGHT;
          } else if (candidateHeight > SHEET_MIN_HEIGHT + 50) {
            target = SHEET_MID_HEIGHT;
          } else {
            target = SHEET_MIN_HEIGHT;
          }
        } else {
          target = candidateHeight > SHEET_MIN_HEIGHT + 50 ? SHEET_MID_HEIGHT : SHEET_MIN_HEIGHT;
        }

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

  const toggleHeatmap = () => {
    // Show alert only on first click when enabling heatmap
    if (!showHeatmap && !hasSeenHeatmapInfo) {
      Alert.alert(
        'Heatmap View',
        'Heatmap shows spending intensity across locations. Red areas indicate highest spending, transitioning through orange and yellow to green for lower spending.',
        [
          {
            text: 'Got it',
            onPress: () => {
              setHasSeenHeatmapInfo(true);
              setShowHeatmap(true);
            }
          }
        ]
      );
    } else {
      setShowHeatmap(!showHeatmap);
    }
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
        {/* Heatmap Layer */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            radius={40}
            opacity={0.7}
            gradient={{
              colors: ['#00FF00', '#FFFF00', '#FF8C00', '#FF0000'],
              startPoints: [0.1, 0.4, 0.7, 1.0],
              colorMapSize: 256
            }}
          />
        )}

        {/* Markers - only show when heatmap is off */}
        {!showHeatmap && expenses.map((expense) => {
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
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* HEATMAP TOGGLE BUTTON - Only show when heatmap is available */}
      {shouldShowHeatmap(selectedFilter) && heatmapPoints.length > 0 && (
        <Animated.View 
          style={[
            styles.heatmapBtn, 
            showHeatmap && styles.heatmapBtnActive,
            {
              bottom: Animated.add(sheetHeight, 10)
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.heatmapBtnInner}
            onPress={toggleHeatmap}
          >
            <Ionicons 
              name={showHeatmap ? "flame" : "flame-outline"} 
              size={22} 
              color={showHeatmap ? "#FF4444" : "#1F2937"} 
            />
          </TouchableOpacity>
        </Animated.View>
      )}

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
              <Text style={styles.locDesc} numberOfLines={1} ellipsizeMode="tail">
                {currentAddress}
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
            <TouchableOpacity
              style={styles.checkBtn}
              onPress={handleCheckNearby}
              disabled={loadingNearby}
            >
              {loadingNearby ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.checkBtnText}>Check Nearby Places (50m)</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Nearby Places */}
          {showMax && nearbyPlaces.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.nearbyTitle}>Nearby Places</Text>
              {nearbyPlaces.map((place) => (
                <View key={place.id} style={styles.placeItem}>
                  <View style={styles.placeIcon}>
                    <Ionicons name="location" size={20} color="#374151" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeType}>{place.type}</Text>
                  </View>
                  <Text style={styles.placeDist}>{place.distanceText}</Text>
                </View>
              ))}
            </View>
          )}

          {showMax && nearbyPlaces.length === 0 && !loadingNearby && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No places found nearby</Text>
              <Text style={styles.emptySubtext}>Try expanding the search radius</Text>
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

  heatmapBtn: {
    position: 'absolute',
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    elevation: 50,
  },

  heatmapBtnInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heatmapBtnActive: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 5,
  },

  filterChipsContainer: {
    position: 'absolute',
    top: 115,
    left: 0,
    right: 0,
  },

  filterChipsContent: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 5,
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
    letterSpacing: 0.5,
  },

  calloutAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },

  calloutName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  calloutDate: {
    fontSize: 11,
    color: Colors.textTertiary,
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
    flexShrink: 1,
  },

  heatmapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },

  heatmapInfoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  checkBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  checkBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },

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

  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },

  placeType: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },

  placeDist: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600'
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
  },
});