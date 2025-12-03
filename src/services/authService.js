// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class AuthService {
  // Sign Up with Email
  async signUpWithEmail(email, password, displayName) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile dengan displayName
      await updateProfile(user, {
        displayName: displayName
      });

      // Simpan data user ke Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        displayName: displayName,
        name: displayName,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });

      console.log('User registered successfully:', user.uid);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign In with Email
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Jika displayName belum ada, ambil dari Firestore
      if (!firebaseUser.displayName) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const name = userData.displayName || userData.name;
            
            if (name) {
              // Update Firebase Auth profile
              await updateProfile(firebaseUser, {
                displayName: name
              });
              
              // Reload user to get updated data
              await firebaseUser.reload();
            }
          }
        } catch (firestoreError) {
          console.error('Error fetching user data from Firestore:', firestoreError);
        }
      }

      console.log('User signed in successfully:', firebaseUser.uid);

      return {
        success: true,
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User'
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign In with Google - PLACEHOLDER (belum diimplementasikan)
  async signInWithGoogle() {
    // Untuk sementara return error karena belum disetup
    console.warn('Google Sign In is not configured yet');
    return { 
      success: false, 
      error: 'Google Sign In is not available yet' 
    };
  }

  // Get Google Auth Config - METHOD BARU untuk menghindari error
  getGoogleAuthConfig() {
    return {
    androidClientId:
      "1071556685406-po3s35bq2fb0j29il3bugp635l6hj70v.apps.googleusercontent.com",
    webClientId:
      "1071556685406-o7cmoq0qu14pqe1f3hue78dm0i3sdipr.apps.googleusercontent.com",
    iosClientId:
      "1071556685406-83amjl5lgmnkpqcuka25jihrbr3dhnpn.apps.googleusercontent.com",
    scopes: ["profile", "email"],
    redirectUri: undefined,
  };
  }

  // Sign Out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      console.log('User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Jika displayName belum ada di Firebase Auth, coba ambil dari Firestore
        if (!firebaseUser.displayName) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const name = userData.displayName || userData.name;
              
              if (name) {
                await updateProfile(firebaseUser, {
                  displayName: name
                });
                await firebaseUser.reload();
                // Trigger callback dengan user yang sudah ter-update
                callback(auth.currentUser);
                return;
              }
            }
          } catch (error) {
            console.error('Error syncing user data:', error);
          }
        }
      }
      
      // Trigger callback dengan firebaseUser
      callback(firebaseUser);
    });
  }

  // Helper function untuk error messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'Email not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'An error occurred. Please try again';
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  }
}

export default new AuthService();