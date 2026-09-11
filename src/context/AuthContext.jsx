import React, { createContext, useContext, useState, useEffect } from 'react';
import dataStore from '../services/dataStore';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => dataStore.getCurrentUser());
  const [allUsers, setAllUsers] = useState(() => dataStore.users);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('kweshun_auth_logged_in');
    return saved === null || saved === 'true';
  });
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
      setAllUsers([...dataStore.users]);
    });
    return unsubscribe;
  }, []);

  const login = (identifier, password) => {
    const res = dataStore.loginUser(identifier, password);
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem('kweshun_auth_logged_in', 'true');
      if (addToast) {
        addToast({ title: 'Welcome back!', message: `Logged in as ${res.user.name}`, type: 'success' });
      }
      return { success: true, user: res.user };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = (data) => {
    const { name, username, email, password, handle, institution, dp, streak, rank } = data;
    const cleanUsername = username || (handle ? handle.replace('@', '') : name.toLowerCase().replace(/\s+/g, '_'));
    const res = dataStore.registerUser({ 
      name, 
      username: cleanUsername, 
      email, 
      password: password || 'pass123'
    });
    if (res.error) {
      if (addToast) {
        addToast({ title: 'Registration Failed', message: res.error, type: 'error' });
      }
      return { success: false, error: res.error };
    }
    if (institution || rank || dp) {
      dataStore.updateUser(res.user.id, { 
        institution: institution || 'Academic Scholar', 
        rank: rank || 'Scholar Tier', 
        dp: dp || 1500, 
        streak: streak || 1 
      });
    }
    const updated = dataStore.getCurrentUser();
    setCurrentUser(updated);
    setIsAuthenticated(true);
    localStorage.setItem('kweshun_auth_logged_in', 'true');
    if (addToast) {
      addToast({ title: 'Account Created', message: `Welcome to Kweshun, ${updated.name}!`, type: 'success' });
    }
    return { success: true, user: updated };
  };

  const updateUser = (updates) => {
    if (currentUser?.id) {
      const updated = dataStore.updateUser(currentUser.id, updates);
      if (updated) {
        setCurrentUser(updated);
      }
    }
  };

  const switchUser = (userId) => {
    dataStore.setCurrentUser(userId);
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('kweshun_auth_logged_in', 'true');
    if (addToast) {
      addToast({ title: 'Profile Switched', message: `Now viewing as ${user.name}`, type: 'info' });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('kweshun_auth_logged_in', 'false');
    if (addToast) {
      addToast({ title: 'Signed Out', message: 'You have been signed out.', type: 'info' });
    }
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      currentUser,
      isAuthenticated,
      allUsers,
      login,
      register,
      updateUser,
      switchUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
