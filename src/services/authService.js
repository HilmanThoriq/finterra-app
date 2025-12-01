// src/services/authService.js
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Google OAuth Configuration
const GOOGLE_WEB_CLIENT_ID = '1071556685406-o7cmoq0qu14pqe1f3hue78dm0i3sdipr.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '1071556685406-83amjl5lgmnkpqcuka25jihrbr3dhnpn.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '1071556685406-po3s35bq2fb0j29il3bugp635l6hj70v.apps.googleusercontent.com';

class AuthService {
  // Email & Password Sign Up
  async signUpWithEmail(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || 'User',
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: 'email'
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName || 'User'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Email & Password Sign In
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: userData?.displayName || 'User',
          photoURL: userData?.photoURL || null
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Google Sign In - Returns config for expo-auth-session
  getGoogleAuthConfig() {
    return {
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
    };
  }

  // Process Google Sign In after getting token
  async processGoogleSignIn(idToken) {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          provider: 'google'
        });
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign Out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Current User
  getCurrentUser() {
    return auth.currentUser;
  }

  // Auth State Listener
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Error Message Handler (ENGLISH)
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Email is already registered',
      'auth/invalid-email': 'Invalid email format',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak (min. 6 characters)',
      'auth/user-disabled': 'Account has been disabled',
      'auth/user-not-found': 'Email not registered',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/too-many-requests': 'Too many attempts, please try again later',
      'auth/network-request-failed': 'No internet connection'
    };

    return errorMessages[errorCode] || 'An error occurred, please try again';
  }
}

export default new AuthService();