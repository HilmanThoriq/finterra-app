import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL
        });
      } else {
        // User is signed out
        setUser(null);
      }
      
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  const signUp = async (email, password, displayName) => {
    setLoading(true);
    const result = await authService.signUpWithEmail(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signIn = async (email, password) => {
    setLoading(true);
    const result = await authService.signInWithEmail(email, password);
    setLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const result = await authService.signInWithGoogle();
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setLoading(false);
    return result;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };

  // Show nothing while checking auth state
  if (initializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};