<div align="center">
  <img src="./assets/images/finterra-icon.png" alt="FINTERRA Logo" width="150" height="150" />
  
  <h1>🌍 FINTERRA 🌍</h1>
  <h3>Smart Spending Management with Location-Based Intelligence</h3>
  <p><em>Track Your Spending, Control Your Budget</em></p>
  
  <p>
    <a href="https://expo.dev">
      <img src="https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK" />
    </a>
    <a href="https://reactnative.dev">
      <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
    </a>
    <a href="https://firebase.google.com/">
      <img src="https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    </a>
    <a href="https://mapsplatform.google.com/">
      <img src="https://img.shields.io/badge/Google_Maps-Platform-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps" />
    </a>
    <a href="https://developers.google.com/maps/documentation/places">
      <img src="https://img.shields.io/badge/Google_Places-API-34A853?style=for-the-badge&logo=google&logoColor=white" alt="Google Places" />
    </a>
  </p>
</div>

---

## 📖 Tentang FINTERRA

**FINTERRA** adalah aplikasi mobile expense tracker yang revolusioner, menggabungkan manajemen keuangan dengan kecerdasan lokasi. Aplikasi ini tidak hanya membantu Anda mencatat pengeluaran, tetapi juga memvisualisasikan di mana uang Anda dihabiskan melalui peta interaktif berbasis Google Maps.

Dengan FINTERRA, Anda dapat:
- 💰 Melacak setiap rupiah yang Anda keluarkan
- 📍 Melihat lokasi geografis dari setiap transaksi
- 📊 Memantau budget bulanan dengan visualisasi real-time
- 🗺️ Menemukan tempat-tempat terdekat dengan GPS precision
- 📈 Menganalisis pola pengeluaran dengan statistik lengkap
- 🔥 Visualisasi heatmap untuk hotspot pengeluaran


---

## ✨ Fitur Unggulan

### 1. 💸 Smart Expense Management
- **Quick Add Expense:** Tambah pengeluaran dalam hitungan detik dengan form intuitif
- **7 Kategori:** Food, Transport, Shopping, Entertainment, Health, Bills, Others
- **Auto-categorization:** Sistem rekomendasi kategori berdasarkan lokasi
- **Multi-currency Support:** Format Rupiah (IDR) dengan thousand separators

### 2. 📍 Location-Based Intelligence
- **GPS Tracking:** Setiap transaksi tercatat dengan koordinat GPS presisi
- **Interactive Map:** Visualisasi semua pengeluaran pada peta interaktif Google Maps
- **Geocoding:** Konversi otomatis koordinat GPS menjadi alamat lengkap
- **Nearby Places:** Temukan tempat-tempat dalam radius 50 meter dengan Google Places API
- **Real-time Distance Calculation:** Haversine formula untuk akurasi jarak sebenarnya
- **Heatmap Visualization:** Identifikasi zona hotspot pengeluaran dengan color-coded density

### 3. 📊 Budget Monitoring Dashboard
- **Monthly Budget Tracker:** Set dan pantau budget bulanan dengan progress bar
- **Smart Alerts:** Peringatan otomatis saat mendekati limit budget (70% threshold)
- **4 Key Metrics:**
  - Total Spent (bulan berjalan)
  - Transaction Count (all-time)
  - Top Category (berbasis frekuensi & nominal)
  - Daily Average (rata-rata harian)
- **Recent Transactions:** Preview 3 transaksi terakhir di home screen

### 4. 🔍 Advanced History & Search
- **Dynamic Filtering:** Filter by Today, Yesterday, This Week, This Month, Prev Month
- **Category Filter:** Filter berdasarkan 7 kategori pengeluaran
- **Smart Search:** Cari transaksi berdasarkan location name, note, atau category
- **Date Grouping:** Pengelompokan otomatis (TODAY, YESTERDAY, specific dates)
- **Summary Statistics:** Total spent & transaction count untuk periode terfilter

### 5. ✏️ Full CRUD Operations
- **Create:** Tambah expense dengan detail lengkap (amount, category, location, note, date/time)
- **Read:** View detail expense dengan map visualization
- **Update:** Edit semua field expense dengan real-time sync
- **Delete:** Hapus expense dengan confirmation dialog

### 6. 🔐 Secure Authentication
- **Firebase Authentication:** Email/password login yang aman
- **User Profile Management:** Display name, email, dan foto profil
- **Auto-sync:** Data tersinkronisasi otomatis antar perangkat
- **Session Management:** Persistent login dengan token refresh

---

## 🛠️ Komponen Pembangun Produk

### **Frontend Framework**
| Komponen | Teknologi | Versi | Fungsi |
|----------|-----------|-------|--------|
| **Mobile Framework** | React Native | 0.81.5 | Core framework untuk aplikasi mobile cross-platform |
| **Development Platform** | Expo | SDK 54 | Mempercepat development dengan managed workflow |
| **Navigation** | React Navigation v7 | 7.x | Stack & Bottom Tabs navigation pattern |
| **UI Components** | React Native Core | Built-in | TouchableOpacity, ScrollView, TextInput, Modal |
| **Icons** | Expo Vector Icons | 15.0.3 | 10,000+ icon library (Ionicons focus) |
| **Date Handling** | @react-native-community/datetimepicker | 8.5.1 | Native date & time picker |

### **Backend & Database**
| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| **Database** | Firebase Firestore | NoSQL cloud database untuk real-time data sync |
| **Authentication** | Firebase Auth | Secure user authentication dengan email/password |
| **Cloud Storage** | Firestore Collections | Struktur data: `users`, `expenses`, `budgets` |

### **Maps & Location**
| Komponen | API/Library | Fungsi |
|----------|-------------|--------|
| **Map Engine** | Google Maps SDK | Render interactive maps (Android & iOS) |
| **Location Services** | Expo Location | GPS tracking dengan high accuracy mode |
| **Geocoding** | Google Geocoding API | Convert coordinates → addresses |
| **Places Search** | Google Places API | Nearby places discovery & details |
| **Heatmap** | Google Maps Heatmap Layer | Visualisasi density pengeluaran |

### **State Management & Logic**
- **React Hooks:** `useState`, `useEffect`, `useRef`, `useContext`
- **Context API:** `AuthContext` untuk global user state
- **Custom Services:** `firestoreService.js`, `authService.js`
- **Business Logic:** Haversine distance calculation, date grouping, budget percentage

---

## 📊 Struktur Database

FINTERRA menggunakan **Firebase Firestore** dengan struktur koleksi berikut:

```javascript
// Collection: users
{
  uid: "hilman_thoriq_123",
  email: "hilmanthoriq@mail.ugm.ac.id",
  displayName: "Hilman Thoriq",
  createdAt: Timestamp(2025-01-15T08:30:00Z)
}

// Collection: expenses (Contoh Data Real)
{
  id: "exp_001",
  userId: "hilman_thoriq_123",
  amount: 35000,
  category: "food",
  locationName: "Kopi Kenangan Jalan Kaliurang KM 5",
  location: {
    latitude: -7.7644,
    longitude: 110.3753
  },
  note: "Kopi sore setelah kuliah PGPBL",
  date: Timestamp(2025-01-15T16:45:00Z),
  createdAt: Timestamp(2025-01-15T16:45:30Z),
  updatedAt: Timestamp(2025-01-15T16:45:30Z)
}

{
  id: "exp_002",
  userId: "hilman_thoriq_123",
  amount: 50000,
  category: "transport",
  locationName: "Jalan Kaliurang KM 5 - Kampus UGM",
  location: {
    latitude: -7.7703,
    longitude: 110.3774
  },
  note: "Gojek pulang dari kampus",
  date: Timestamp(2025-01-15T18:20:00Z),
  createdAt: Timestamp(2025-01-15T18:20:15Z)
}

{
  id: "exp_003",
  userId: "hilman_thoriq_123",
  amount: 125000,
  category: "shopping",
  locationName: "Ambarrukmo Plaza Yogyakarta",
  location: {
    latitude: -7.7824,
    longitude: 110.4026
  },
  note: "Beli buku GIS untuk referensi tugas akhir",
  date: Timestamp(2025-01-16T14:30:00Z),
  createdAt: Timestamp(2025-01-16T14:30:45Z)
}

// Collection: budgets
{
  userId: "hilman_thoriq_123",
  amount: 2000000,
  month: "2025-01",
  updatedAt: Timestamp(2025-01-01T00:00:00Z)
}
```

### **Relasi Data:**
- **One-to-Many:** 1 User → Many Expenses
- **One-to-One:** 1 User → 1 Budget (per month)
- **Index Optimization:** Query dengan `where('userId', '==', uid)` + in-memory filtering

---

## 🌐 Sumber Data & API

| Sumber | Provider | Endpoint/Usage | Fungsi |
|--------|----------|----------------|--------|
| **User Data** | Firebase Firestore | `users` collection | Profile, authentication data |
| **Expense Data** | Firebase Firestore | `expenses` collection | Transaction records |
| **Budget Data** | Firebase Firestore | `budgets` collection | Monthly budget settings |
| **Location Coordinates** | Expo Location | `getCurrentPositionAsync()` | Real-time GPS tracking |
| **Address Geocoding** | Google Geocoding API | `/maps/api/geocode/json` | Coordinates → Address |
| **Nearby Places** | Google Places API | `/maps/api/place/nearbysearch/json` | POI discovery (50m radius) |
| **Map Visualization** | Google Maps SDK | React Native Maps | Interactive map rendering |
| **Heatmap Data** | Google Maps Heatmap Layer | Weighted lat/lng points | Density visualization |


### **API Keys Required:**
```json
{
  "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY",
  "firebaseConfig": {
    "apiKey": "YOUR_FIREBASE_API_KEY",
    "authDomain": "...",
    "projectId": "...",
    "storageBucket": "...",
    "messagingSenderId": "...",
    "appId": "..."
  }
}
```

---

## 📸 Tangkapan Layar Produk

### 🔐 **Authentication Flow**
| Splash Screen | Onboarding 1 | Onboarding 2 | Onboarding 3 |
|:-------------:|:------------:|:------------:|:------------:|
| ![Splash](./assets/images-readme/splash-screen.png) | ![Onboarding 1](./assets/images-readme/onboarding-1.png) | ![Onboarding 2](./assets/images-readme/onboarding-2.png) | ![Onboarding 3](./assets/images-readme/onboarding-3.png) |

| Login Screen | Register Screen |
|:------------:|:---------------:|
| ![Login](./assets/images-readme/login-screen.png) | ![Register](./assets/images-readme/register-screen.png) |

---

### 📱 **Main Tabs**
| Home Dashboard | Map View | Add Expense Modal |
|:--------------:|:--------:|:-----------------:|
| ![Home](./assets/images-readme/home-screen.png) | ![Map](./assets/images-readme/map-screen.png) | ![Add Expense](./assets/images-readme/add-expense-modal.png) |

| History Screen | Profile Screen |
|:--------------:|:--------------:|
| ![History](./assets/images-readme/history-screen.png) | ![Profile](./assets/images-readme/profile-screen.png) |

---

### 🔧 **Additional Screens**
| Set Budget | Expense Detail | Edit Expense Modal | Notifications |
|:----------:|:--------------:|:------------------:|:-------------:|
| ![Set Budget](./assets/images-readme/set-budget-screen.png) | ![Detail](./assets/images-readme/expense-detail-screen.png) | ![Edit](./assets/images-readme/edit-expense-modal.png) | ![Notifications](./assets/images-readme/notifications-screen.png) |

---

## 📂 Struktur Folder

```text
FINTERRA-APP/
├── assets/
│   ├── fonts/                  # Custom fonts (if any)
│   └── images/
│       ├── finterra-icon.png   # App icon
│       └── splash.png          # Splash screen
├── src/
│   ├── config/
│   │   └── firebase.js         # Firebase configuration
│   ├── constants/
│   │   └── Colors.js           # Color palette definitions
│   ├── context/
│   │   └── AuthContext.js      # Global auth state management
│   ├── navigation/
│   │   ├── AppNavigator.js     # Root navigation
│   │   └── MainTabNavigator.js # Bottom tabs config
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── OnboardingScreen.js
│   │   │   └── SplashScreen.js
│   │   └── main/
│   │       ├── HomeScreen.js           # Dashboard
│   │       ├── AddExpenseModal.js      # Add expense
│   │       ├── EditExpenseModal.js     # Edit expense
│   │       ├── ExpenseDetailsScreen.js # Expense detail
│   │       ├── HistoryScreen.js        # Transaction list
│   │       ├── MapScreen.js            # Map visualization
│   │       ├── NotificationsScreen.js  # Notifications
│   │       ├── ProfileScreen.js        # User profile
│   │       └── SetBudgetScreen.js      # Budget setting
│   └── services/
│       ├── authService.js      # Auth business logic
│       └── firestoreService.js # Firestore CRUD operations
├── App.js                       # Entry point
├── app.json                     # Expo config + API keys
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🚀 Instalasi & Cara Menjalankan

### **Prerequisites:**
- Node.js v18+ dan npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (untuk Android emulator) atau Xcode (untuk iOS simulator)
- Firebase project dengan Firestore & Auth enabled
- Google Cloud project dengan Maps, Places, Geocoding APIs enabled

### **Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/finterra-app.git
cd finterra-app
```

### **Step 2: Install Dependencies**
```bash
npm install
# atau
yarn install
```

### **Step 3: Setup Environment**

1. **Firebase Setup:**
   - Buat file `src/config/firebase.js`
   - Copy Firebase config dari Firebase Console → Project Settings

```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

2. **Google Maps API Setup:**
   - Edit `app.json`
   - Tambahkan Google Maps API Key

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### **Step 4: Run Application**
```bash
# Start Expo development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on web (limited functionality)
npx expo start --web
```

### **Step 5: Build for Production**
```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios
```

---

## 🔮 Future Development

### **Phase 1: Enhanced Financial Management (Q1 2025)**
- 📊 **Monthly Financial Report:** Laporan analisis keuangan bulanan lengkap dengan grafik dan insights
- 💾 **Export to PDF/Excel:** Export laporan ke berbagai format (PDF, Excel, CSV)
- 📅 **Daily Budget Management:** Atur budget harian dengan tracking otomatis
- 🔔 **Smart Notifications:** Peringatan budget, reminder pengeluaran, dan tips hemat
- 📍 **Location-Based Reminders:** Pengingat untuk mencatat pengeluaran saat berada di lokasi yang sering dikunjungi (mall, restoran, dll)
- 🎯 **Category Budget Allocation:** Atur budget per kategori per bulan (misal: Food Rp 1jt, Transport Rp 500rb)

### **Phase 2: Multi-Currency & Global Support (Q2 2025)**
- 💱 **Multi-Currency Support:** IDR, USD, MYR, SGD, EUR, JPY dengan auto-conversion
- 🌐 **Real-time Exchange Rates:** Integrasi dengan Currency API untuk kurs terkini
- 🗺️ **International Location Support:** Google Places global coverage

### **Phase 3: AI & Smart Features (Q3-Q4 2025)**
- 🤖 **AI Integration:** Machine learning untuk prediksi pengeluaran
- 🧠 **Smart Analysis:** Pattern recognition untuk spending habits
- 📸 **Auto Receipt Scanning:** OCR technology untuk scan nota belanja otomatis
- 💡 **AI Recommendations:** Saran personalized untuk menghemat uang
- 📈 **Predictive Budget:** Estimasi pengeluaran bulan depan berdasarkan data historis

### **Phase 4: Advanced Features (2026)**
- 👥 **Shared Budgets:** Fitur untuk family/group budget management
- 💳 **Bank Integration:** Connect dengan rekening bank untuk auto-sync transactions
- 🏆 **Gamification:** Achievement badges untuk saving goals
- 📱 **Widget Support:** Home screen widget untuk iOS & Android

---

## 👨‍💻 Tentang Pengembang

Aplikasi ini dikembangkan sebagai bagian dari tugas akhir praktikum **Pemrograman Geospasial: Perangkat Bergerak Lanjut**.

**Developer:**
- **Nama:** Hilman Thoriq
- **NIM:** 23/522897/SV/23809
- **Program Studi:** Sistem Informasi Geografis 2023
- **Institusi:** Universitas Gadjah Mada (UGM)
- **Mata Kuliah:** Praktikum Pemrograman Geospasial: Perangkat Bergerak Lanjut
- **Tahun Akademik:** 2024/2025

---

<div align="center">
  <img src="./assets/images/finterra-icon.png" alt="FINTERRA" width="80" />
  
  <h3>FINTERRA</h3>
  <p><em>Track Your Spending, Control Your Budget</em></p>
  
  <p>
    <a href="https://github.com/yourusername/finterra-app/stargazers">⭐ Star this repo</a> •
    <a href="https://github.com/yourusername/finterra-app/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/finterra-app/issues">💡 Request Feature</a>
  </p>
  
  <small>© 2025 FINTERRA Project. Developed with ❤️ by Hilman Thoriq | UGM</small>
</div>
