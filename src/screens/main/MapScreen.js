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
  PanResponder
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = 180;
const SHEET_MID_HEIGHT = 240;
const SHEET_MAX_HEIGHT = height * 0.65;

export default function MapScreen({ navigation }) {
  // Refs & States
  const mapRef = useRef(null);
  const [allowMaxHeight, setAllowMaxHeight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // Animated value for sheet height
  const sheetHeight = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;

  // Only update "logical" heights / UI flags when necessary (avoid per-frame state updates)
  const [currentSheetHeight, setCurrentSheetHeight] = useState(SHEET_MIN_HEIGHT);
  const [showMid, setShowMid] = useState(false); // whether sheet is at/above mid (for showing Check button)
  const [showMax, setShowMax] = useState(false); // whether sheet is at/above max (for showing nearby list)

  // keep a ref of previous value to detect threshold crossing (no re-render on ref change)
  const prevValueRef = useRef(SHEET_MIN_HEIGHT);

  // listener: only update flags when crossing thresholds (avoid setState each frame)
  useEffect(() => {
    const id = sheetHeight.addListener(({ value }) => {
      const prev = prevValueRef.current;

      // MID threshold crossing
      if (value >= SHEET_MID_HEIGHT && prev < SHEET_MID_HEIGHT) {
        setShowMid(true);
      } else if (value < SHEET_MID_HEIGHT && prev >= SHEET_MID_HEIGHT) {
        setShowMid(false);
      }

      // MAX threshold crossing
      if (value >= SHEET_MAX_HEIGHT && prev < SHEET_MAX_HEIGHT) {
        setShowMax(true);
      } else if (value < SHEET_MAX_HEIGHT && prev >= SHEET_MAX_HEIGHT) {
        setShowMax(false);
      }

      prevValueRef.current = value;
      // DO NOT set currentSheetHeight here to avoid re-renders every frame.
    });

    return () => {
      sheetHeight.removeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expenses = [
    { id: 1, name: 'Kopi Kenangan', amount: 55000, category: 'Food & Drink', lat: -6.2, lng: 106.816666, color: Colors.categoryFood },
    { id: 2, name: 'Grand Indonesia', amount: 450000, category: 'Shopping', lat: -6.195, lng: 106.82, color: Colors.categoryShopping },
  ];

  // Load location
  useEffect(() => {
    getCurrentLocation();
  }, []);

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

  // Helper to animate to a target height and update currentSheetHeight when animation finishes
  const animateTo = (toValue) => {
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      bounciness: 0,
    }).start(() => {
      // update logical state when the animation completes
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

  // PANRESPONDER — Drag logic (stable, avoids flicker)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {
        // gestureState.dy: positive when dragging down, negative when dragging up
        const isDraggingUp = gestureState.dy < 0;

        // Compute tentative new height
        const candidateHeight = currentSheetHeight - gestureState.dy;

        // If user tries to drag up but MAX isn't allowed, block upward movement beyond MID
        if (!allowMaxHeight && isDraggingUp && candidateHeight > SHEET_MID_HEIGHT) {
          // clamp to mid while dragging (don't update state, only set Animated value)
          sheetHeight.setValue(SHEET_MID_HEIGHT);
          return;
        }

        const maxLimit = allowMaxHeight ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;

        // Clamp candidateHeight into allowable range
        const clamped = Math.max(SHEET_MIN_HEIGHT, Math.min(candidateHeight, maxLimit));
        sheetHeight.setValue(clamped);
      },

      onPanResponderRelease: (_, gestureState) => {
        const isDraggingUp = gestureState.dy < 0;
        const candidateHeight = currentSheetHeight - gestureState.dy;
        const maxLimit = allowMaxHeight ? SHEET_MAX_HEIGHT : SHEET_MID_HEIGHT;

        // If not allowed to go max and user dragged up, snap to MID (prevents direct MAX)
        if (!allowMaxHeight && isDraggingUp) {
          animateTo(SHEET_MID_HEIGHT);
          return;
        }

        // Snap logic:
        let target = SHEET_MIN_HEIGHT;
        if (candidateHeight > SHEET_MID_HEIGHT + 50 && allowMaxHeight) {
          target = SHEET_MAX_HEIGHT;
        } else if (candidateHeight > SHEET_MIN_HEIGHT + 50) {
          target = SHEET_MID_HEIGHT;
        } else {
          target = SHEET_MIN_HEIGHT;
        }

        // ensure target doesn't exceed permitted maxLimit
        if (target > maxLimit) target = maxLimit;

        animateTo(target);
      },
    })
  ).current;

  const centerMapToUser = () => {
    if (!currentLocation || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600
    );
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
      {expenses.map((expense) => (
        <Marker
          key={expense.id}
          coordinate={{ latitude: expense.lat, longitude: expense.lng }}
          pinColor={expense.color}
        >
          <Callout
            tooltip
            onPress={() => navigation.navigate('ExpenseDetail', { id: expense.id })}
          >
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutCat}>{expense.category}</Text>
              <Text style={styles.calloutAmount}>
                Rp {expense.amount.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.calloutName}>{expense.name}</Text>
              <Text style={styles.calloutLink}>View Detail</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>

    {/* SEARCH BAR & FILTER */}
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
      </View>

      <TouchableOpacity style={styles.filterBtn}>
        <Ionicons name="options-outline" size={20} color="#1F2937" />
      </TouchableOpacity>
    </View>

    {/* GEOLOCATION BUTTON — FLOATING */}
    <TouchableOpacity style={styles.geoBtn} onPress={centerMapToUser}>
      <Ionicons name="locate" size={22} color="#1F2937" />
    </TouchableOpacity>

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
            <Ionicons name="location" size={24} color={Colors.primary} />
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

// ---------------------------
// 🎨 STYLE SECTION
// ---------------------------
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

  filterBtn: {
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

  // 🌍 NEW — GEOLOCATION BUTTON
  geoBtn: {
    position: 'absolute',
    top: 115,   // tepat di bawah filter
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
  },

  calloutContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    elevation: 5,
  },

  calloutCat: { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  calloutAmount: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  calloutName: { fontSize: 12, marginBottom: 8, color: '#6B7280' },
  calloutLink: { fontSize: 11, color: Colors.primary, fontWeight: 'bold' },

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
    backgroundColor: Colors.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  locTitle: { fontWeight: 'bold', fontSize: 14, color: '#1F2937' },
  locDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },

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
