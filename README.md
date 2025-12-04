<div align="center">
  <img src="./assets/images/finterra-icon.png" alt="FINTERRA Logo" width="150" height="150" />
  
  <h1>🌍 FINTERRA</h1>
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

> **Filosofi Produk:** "Uang bukan hanya angka, tetapi juga cerita tentang ke mana Anda pergi dan apa yang Anda lakukan."

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
| **Directions** | Google Directions API | (Future) Turn-by-turn navigation |

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
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  createdAt: Timestamp
}

// Collection: expenses
{
  id: "expense123",
  userId: "user123",
  amount: 50000,
  category: "food",
  locationName: "Starbucks Central Park",
  location: {
    latitude: -6.1754,
    longitude: 106.8272
  },
  note: "Lunch with client",
  date: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Collection: budgets
{
  userId: "user123",
  amount: 5000000,
  month: "2025-12",
  updatedAt: Timestamp
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

### 🔐 Authentication Flow
<div align="center">
  <img src="./screenshots/splash-screen.png" alt="Splash Screen" width="250"/>
  <img src="./screenshots/login-screen.png" alt="Login" width="250"/>
  <img src="./screenshots/register-screen.png" alt="Register" width="250"/>
</div>

> **Fitur:** Splash screen dengan auto-login, form validation, Firebase Auth integration

---

### 🏠 Home Dashboard
<div align="center">
  <img src="./screenshots/home-dashboard.png" alt="Home Dashboard" width="600"/>
</div>

**Highlight:**
- Monthly budget card dengan progress bar & warning alerts
- 4 statistic cards: Total Spent, Transactions, Top Category, Daily Average
- Recent 3 transactions dengan kategori icons
- Pull-to-refresh untuk real-time data sync

---

### ➕ Add Expense Modal
<div align="center">
  <img src="./screenshots/add-expense-1.png" alt="Add Expense Form" width="250"/>
  <img src="./screenshots/add-expense-2.png" alt="Category Selection" width="250"/>
  <img src="./screenshots/add-expense-3.png" alt="Location Picker" width="250"/>
</div>

**Fitur:**
- Amount input dengan thousand separator (Rp format)
- 7 kategori dengan color-coded icons
- Date & time picker (default: now)
- Location name + GPS coordinates picker
- Optional note field (multiline)
- Map modal untuk select location

---

### 📜 History Screen
<div align="center">
  <img src="./screenshots/history-main.png" alt="History List" width="250"/>
  <img src="./screenshots/history-filter.png" alt="Filters Applied" width="250"/>
  <img src="./screenshots/history-search.png" alt="Search Results" width="250"/>
</div>

**Fitur:**
- Search bar dengan live filtering
- Filter chips (Today, Yesterday, This Week, This Month, Categories)
- Summary card (total spent + transaction count)
- Date grouping (TODAY, YESTERDAY, specific dates)
- Empty state dengan ilustrasi

---

### 🗺️ Map Visualization
<div align="center">
  <img src="./screenshots/map-markers.png" alt="Map with Markers" width="250"/>
  <img src="./screenshots/map-callout.png" alt="Marker Callout" width="250"/>
  <img src="./screenshots/map-nearby.png" alt="Nearby Places" width="250"/>
</div>

**Fitur:**
- Color-coded markers per category
- Custom callout dengan expense details
- User location tracking (blue dot)
- Search bar untuk filter expenses
- Filter chips untuk date ranges
- Nearby places discovery (50m radius)
- Real-time distance calculation (Haversine)
- Draggable bottom sheet UI

---

### 📝 Expense Details
<div align="center">
  <img src="./screenshots/expense-detail.png" alt="Expense Detail" width="600"/>
</div>

**Highlight:**
- Large amount display dengan category color
- Map view dengan location marker
- Date & time info card
- Notes section (optional)
- Edit button (pencil icon)
- Delete button dengan confirmation

---

### ✏️ Edit Expense
<div align="center">
  <img src="./screenshots/edit-expense.png" alt="Edit Expense Modal" width="600"/>
</div>

**Fitur:**
- Pre-filled form dengan data existing
- Update semua field (amount, category, location, note, date)
- Real-time validation
- Auto-sync ke Firestore
- Success feedback

---

### 👤 Profile & Settings
<div align="center">
  <img src="./screenshots/profile-screen.png" alt="Profile Screen" width="250"/>
  <img src="./screenshots/set-budget.png" alt="Set Budget" width="250"/>
  <img src="./screenshots/notifications.png" alt="Notifications" width="250"/>
</div>

**Fitur:**
- User profile display (name, email)
- Set monthly budget
- Notification preferences
- About app
- Logout functionality

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

## 🎯 Roadmap & Future Features

### **Version 1.1 (Q1 2025)**
- [ ] 📸 Receipt scanning dengan OCR (Optical Character Recognition)
- [ ] 💱 Multi-currency support (USD, EUR, SGD, etc.)
- [ ] 📊 Advanced analytics: Monthly trends, category breakdown pie chart
- [ ] 🔔 Push notifications untuk budget alerts

### **Version 1.2 (Q2 2025)**
- [ ] 👥 Shared budgets untuk family/group
- [ ] 💳 Bank account integration (open banking API)
- [ ] 📤 Export data ke CSV/Excel/PDF
- [ ] 🌙 Dark mode theme

### **Version 2.0 (Q3 2025)**
- [ ] 🤖 AI-powered spending insights & recommendations
- [ ] 🗺️ Heatmap visualization untuk spending hotspots
- [ ] 📱 Widget untuk iOS & Android home screen
- [ ] 🔗 Integration dengan e-wallet (GoPay, OVO, Dana)

---

## 🐛 Known Issues & Limitations

1. **Google Places API:** Membutuhkan billing account aktif (free tier terbatas)
2. **Offline Mode:** Saat ini belum support offline data caching
3. **Location Accuracy:** GPS indoor kurang akurat (margin error ~10-50m)
4. **iOS Maps:** Memerlukan Apple Developer account untuk production build

---

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi! Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

**Conventional Commits:**
- `feat:` untuk fitur baru
- `fix:` untuk bug fixes
- `docs:` untuk dokumentasi
- `style:` untuk formatting
- `refactor:` untuk refactoring code
- `test:` untuk testing

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lengkap.

---

## 👨‍💻 Tim Pengembang

Aplikasi ini dikembangkan sebagai bagian dari tugas akhir praktikum.

**Lead Developer:**
- **Nama:** [Nama Anda]
- **NIM:** [NIM Anda]
- **Program Studi:** Sistem Informasi Geografis
- **Institusi:** [Nama Universitas]
- **Mata Kuliah:** Praktikum Pemrograman Geospasial: Perangkat Bergerak Lanjut

**Supervisor:**
- **Dosen Pengampu:** [Nama Dosen]
- **Email:** [email@university.edu]

---

## 📞 Kontak & Support

Jika Anda memiliki pertanyaan, bug report, atau feature request:

- 📧 Email: [your.email@example.com]
- 💬 GitHub Issues: [Create New Issue](https://github.com/yourusername/finterra-app/issues)
- 🐦 Twitter: [@finterra_app](https://twitter.com/finterra_app)
- 🌐 Website: [finterra-app.com](https://finterra-app.com)

---

## 🙏 Acknowledgments

Terima kasih kepada:
- **Firebase** untuk backend infrastructure yang powerful
- **Google Maps Platform** untuk location services yang akurat
- **Expo** untuk development experience yang luar biasa
- **React Native Community** untuk ecosystem yang solid
- **Open Source Contributors** untuk library-library yang kami gunakan

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
  
  <small>© 2025 FINTERRA Project. Made with ❤️ in Indonesia.</small>
</div>
