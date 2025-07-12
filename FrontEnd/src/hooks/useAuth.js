// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  listenToUserProfile
} from '../firebaseHelpers';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoized callback to prevent re-renders
  const handleUserUpdate = useCallback((userData) => {
    setCurrentUser(userData);
    setLoading(false);
  }, []);

  // Auth State Listener
  useEffect(() => {
    let userProfileUnsubscribe = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Clean up previous listener
        if (userProfileUnsubscribe) {
          userProfileUnsubscribe();
        }
        
        // Set up new listener for user profile
        userProfileUnsubscribe = listenToUserProfile(user.uid, handleUserUpdate);
      } else {
        // Clean up when user logs out
        if (userProfileUnsubscribe) {
          userProfileUnsubscribe();
          userProfileUnsubscribe = null;
        }
        
        setCurrentUser(null);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      authUnsubscribe();
      if (userProfileUnsubscribe) {
        userProfileUnsubscribe();
      }
    };
  }, [handleUserUpdate]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const result = await loginUser(email, password);
      
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (email, password, userData) => {
    setLoading(true);
    setError('');

    try {
      const result = await registerUser(email, password, userData);
      
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message;
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  // Clear error function
  const clearError = () => {
    setError('');
  };

  return {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    clearError
  };
};