import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import firestoreService from '../services/firestoreService';
import dataStore from '../services/dataStore';
import storageService from '../services/storageService';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = storageService.getUser();
    return savedUser && savedUser.isRegistered ? savedUser : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return storageService.isLoggedIn();
  });

  const [loading, setLoading] = useState(true);

  const { showToast, addToast } = useToast();
  const notifyToast = (msg, type = 'info', title = '') => {
    if (showToast) showToast(msg, type);
    else if (addToast) addToast({ title: title || msg, message: msg, type });
  };

  const mapAuthError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email or username already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
        return 'Invalid username/email or password.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'Authentication failed. Please check your credentials.';
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await firestoreService.getUserProfile(firebaseUser.uid);
        if (!profile) {
          profile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Scholar',
            username: firebaseUser.email?.split('@')[0]?.toLowerCase() || 'scholar',
            handle: `@${firebaseUser.email?.split('@')[0]?.toLowerCase() || 'scholar'}`,
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            institution: 'Academic Scholar Guild',
            bio: 'Knowledge repository curator on Kweshun.',
            selectedSubjects: [],
            isRegistered: true,
            createdAt: new Date().toISOString()
          };
          await firestoreService.saveUserProfile(firebaseUser.uid, profile);
        }

        const userObj = { ...profile, id: firebaseUser.uid, uid: firebaseUser.uid, isRegistered: true };
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        storageService.saveUser(userObj);
        storageService.setLoggedIn(true);

        dataStore.users = [userObj];
        dataStore.currentUserId = firebaseUser.uid;
        dataStore.initFirestoreListeners(firebaseUser.uid);
        dataStore.syncUserFromFirestore(firebaseUser.uid);
      } else {
        const localUser = storageService.getUser();
        if (storageService.isLoggedIn() && localUser) {
          setCurrentUser(localUser);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          storageService.setLoggedIn(false);
        }
      }
      setLoading(false);
    });

    const unsubscribeStore = dataStore.subscribe(() => {
      const u = dataStore.getCurrentUser();
      if (u) setCurrentUser(u);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeStore();
    };
  }, []);

  const login = async (identifier, password) => {
    const clean = (identifier || '').trim().toLowerCase();
    const cleanNoAt = clean.replace(/^@+/, '');

    if (!clean) {
      return { success: false, error: 'Please enter your email or username.' };
    }

    try {
      let targetEmail = clean;
      if (!clean.includes('@')) {
        const foundUser = await firestoreService.findUserByUsername(cleanNoAt);
        if (foundUser && foundUser.email) {
          targetEmail = foundUser.email;
        } else {
          const localUser = dataStore.users.find(u => u.username === cleanNoAt);
          if (localUser && localUser.email) {
            targetEmail = localUser.email;
          } else {
            notifyToast('No Kweshun profile found with that username.', 'error', 'Sign In Failed');
            return { success: false, error: 'No Kweshun profile found. Please check your credentials or create a free account.', notFound: true };
          }
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      const uid = userCredential.user.uid;
      let profile = await firestoreService.getUserProfile(uid);
      if (!profile) {
        profile = {
          id: uid,
          uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || cleanNoAt,
          username: cleanNoAt,
          handle: `@${cleanNoAt}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          institution: 'Academic Scholar Guild',
          bio: 'Knowledge repository curator on Kweshun.',
          selectedSubjects: [],
          isRegistered: true
        };
        await firestoreService.saveUserProfile(uid, profile);
      }

      const userObj = { ...profile, id: uid, uid, isRegistered: true };
      setCurrentUser(userObj);
      setIsAuthenticated(true);
      storageService.saveUser(userObj);
      storageService.setLoggedIn(true);

      dataStore.users = [userObj];
      dataStore.currentUserId = uid;
      dataStore.initFirestoreListeners(uid);
      dataStore.syncUserFromFirestore(uid);

      notifyToast(`Welcome back, ${userObj.name}!`, 'success', 'Welcome Back');
      return { success: true, user: userObj };
    } catch (e) {
      console.warn('Firebase Login Error:', e);
      const friendlyError = mapAuthError(e.code);
      notifyToast(friendlyError, 'error', 'Sign In Failed');
      return { success: false, error: friendlyError, notFound: e.code === 'auth/user-not-found' };
    }
  };

  const register = async ({ name, username, email, password, avatar }) => {
    const cleanName = (name || '').trim();
    const cleanUsername = (username || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/^@+/, '') || cleanName.toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Please provide your full name.' };
    if (!cleanUsername) return { success: false, error: 'Please choose an academic username.' };
    if (!cleanEmail) return { success: false, error: 'Please provide a valid email address.' };

    try {
      const existingUser = await firestoreService.findUserByUsername(cleanUsername);
      if (existingUser) {
        notifyToast('An account with this username already exists.', 'error', 'Registration Failed');
        return { success: false, error: 'An account with this email or username already exists.' };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;

      const newUser = {
        id: uid,
        uid,
        name: cleanName,
        username: cleanUsername,
        handle: `@${cleanUsername}`,
        email: cleanEmail,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        institution: 'Academic Scholar Guild',
        bio: 'Knowledge repository curator on Kweshun.',
        selectedSubjects: [],
        isRegistered: true,
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };

      await firestoreService.saveUserProfile(uid, newUser);

      setCurrentUser(newUser);
      setIsAuthenticated(true);
      storageService.saveUser(newUser);
      storageService.setLoggedIn(true);

      dataStore.users = [newUser];
      dataStore.currentUserId = uid;
      dataStore.subjects = [];
      dataStore.questions = [];
      dataStore.saveState();
      dataStore.initFirestoreListeners(uid);

      notifyToast(`Welcome to Kweshun, ${newUser.name}!`, 'success', 'Profile Created');
      return { success: true, user: newUser };
    } catch (e) {
      console.warn('Firebase Register Error:', e);
      const friendlyError = mapAuthError(e.code);
      notifyToast(friendlyError, 'error', 'Registration Failed');
      return { success: false, error: friendlyError };
    }
  };

  const updateUserSubjects = async (subjects) => {
    if (currentUser?.id) {
      const updated = { ...currentUser, selectedSubjects: subjects };
      setCurrentUser(updated);
      storageService.saveUser(updated);
      dataStore.updateUser(currentUser.id, { selectedSubjects: subjects });
      await firestoreService.saveUserProfile(currentUser.id, { selectedSubjects: subjects });
    }
  };

  const updateUser = async (updates) => {
    if (currentUser?.id) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      storageService.saveUser(updated);
      dataStore.updateUser(currentUser.id, updates);
      await firestoreService.saveUserProfile(currentUser.id, updates);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
    dataStore.logoutUser();
    setIsAuthenticated(false);
    storageService.setLoggedIn(false);
    notifyToast('You have been signed out.', 'info', 'Signed Out');
  };

  const isRegistered = Boolean(storageService.isRegistered() || (currentUser && currentUser.isRegistered));

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      currentUser,
      isAuthenticated,
      isRegistered,
      loading,
      login,
      register,
      updateUser,
      updateUserSubjects,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
