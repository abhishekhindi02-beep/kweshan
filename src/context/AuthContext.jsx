import React, { createContext, useContext, useState, useEffect } from 'react';
import dataStore from '../services/dataStore';
import storageService from '../services/storageService';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = storageService.getUser();
    if (savedUser && savedUser.isRegistered) {
      return savedUser;
    }
    return dataStore.getCurrentUser();
  });

  const [allUsers, setAllUsers] = useState(() => dataStore.users);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return storageService.isLoggedIn();
  });

  const { showToast, addToast } = useToast();
  const notifyToast = (msg, type = 'info', title = '') => {
    if (showToast) showToast(msg, type);
    else if (addToast) addToast({ title: title || msg, message: msg, type });
  };

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      const u = dataStore.getCurrentUser();
      setCurrentUser(u);
      setAllUsers([...dataStore.users]);
      setIsAuthenticated(storageService.isLoggedIn());
    });
    return unsubscribe;
  }, []);

  const login = (identifier, password) => {
    const res = dataStore.loginUser(identifier, password);
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      storageService.setLoggedIn(true);
      notifyToast(`Welcome back, ${res.user.name}!`, 'success', 'Welcome Back');
      return { success: true, user: res.user };
    }
    const err = res.error || 'No Kweshun profile found. Please sign up first.';
    notifyToast(err, 'error', 'Sign In Failed');
    return { success: false, error: err };
  };

  const register = (data) => {
    const res = dataStore.registerUser(data);
    if (res.error) {
      notifyToast(res.error, 'error', 'Registration Failed');
      return { success: false, error: res.error };
    }
    setCurrentUser(res.user);
    setIsAuthenticated(true);
    storageService.setLoggedIn(true);
    notifyToast(`Welcome to Kweshun, ${res.user.name}!`, 'success', 'Profile Created');
    return { success: true, user: res.user };
  };

  const updateUserSubjects = (subjects) => {
    if (currentUser?.id) {
      const updated = dataStore.updateUser(currentUser.id, { selectedSubjects: subjects });
      if (updated) {
        setCurrentUser(updated);
        storageService.saveUser(updated);
      }
    }
  };

  const updateUser = (updates) => {
    if (currentUser?.id) {
      const updated = dataStore.updateUser(currentUser.id, updates);
      if (updated) {
        setCurrentUser(updated);
        storageService.saveUser(updated);
      }
    }
  };

  const switchUser = (userId) => {
    dataStore.setCurrentUser(userId);
    const user = dataStore.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(true);
    storageService.setLoggedIn(true);
    notifyToast(`Now viewing as ${user.name}`, 'info', 'Profile Switched');
  };

  const logout = () => {
    setIsAuthenticated(false);
    storageService.setLoggedIn(false);
    notifyToast('You have been signed out.', 'info', 'Signed Out');
  };

  const isRegistered = Boolean(storageService.isRegistered());

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      currentUser,
      isAuthenticated,
      isRegistered,
      allUsers,
      login,
      register,
      updateUser,
      updateUserSubjects,
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
