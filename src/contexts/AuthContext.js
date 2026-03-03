import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

// Provides auth state to the entire app.
// Listens to Firebase Auth state changes and syncs the user's Firestore profile in real-time.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user object
  const [userData, setUserData] = useState(null); // Firestore user profile (name, relationshipId, etc.)
  const [loading, setLoading] = useState(true);   // True until we know if user is logged in

  useEffect(() => {
    // Listen for login/logout events
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // Clear user data before setting user to null
        // to prevent components from reading null user
        setUserData(null);
        setUser(null);
        setLoading(false);
      } else {
        setUser(firebaseUser);
      }
    });

    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return;

    // When logged in, subscribe to the user's Firestore doc for real-time updates
    // (e.g. when relationshipId gets set after partner joins)
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserData({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });

    return unsubUser;
  }, [user]);

  const value = {
    user,
    userData,
    loading,
    signUp: authService.signUp,
    login: authService.login,
    logout: authService.logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth state from any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
