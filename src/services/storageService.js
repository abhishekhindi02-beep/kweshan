/**
 * Centralized LocalStorage Service for Kweshun Prototype
 * Provides structured persistence under standardized keys.
 */

export const STORAGE_KEYS = {
  USERS: 'kweshun_users',
  USER: 'kweshun_user',
  CURRENT_USER: 'kweshun_current_user',
  AUTH_SESSION: 'kweshun_auth_logged_in',
  QUESTIONS: 'kweshun_questions',
  DECKS: 'kweshun_decks',
  BATTLES: 'kweshun_battles',
  FRIENDS: 'kweshun_friends',
  PENDING_REQUESTS: 'kweshun_pending_requests',
  NOTIFICATIONS: 'kweshun_notifications',
  ACTIVITY: 'kweshun_activity',
  DP: 'kweshun_dp',
  STREAK: 'kweshun_streak',
  DECK_PROGRESS: 'kweshun_deck_progress',
  QUESTION_ANALYTICS: 'kweshun_question_analytics',
  THEME: 'kweshun_theme',
  APP_STATE: 'kweshun_app_state_v3'
};

class StorageService {
  getItem(key, defaultValue = null) {
    try {
      if (typeof localStorage === 'undefined') return defaultValue;
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`StorageService: Failed to read ${key}`, e);
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`StorageService: Failed to write ${key}`, e);
    }
  }

  removeItem(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`StorageService: Failed to remove ${key}`, e);
    }
  }

  // --- Specialized Domain Getters & Setters ---
  getUsers() {
    return this.getItem(STORAGE_KEYS.USERS, []);
  }

  saveUsers(users) {
    this.setItem(STORAGE_KEYS.USERS, Array.isArray(users) ? users : []);
  }

  getUser() {
    return this.getItem(STORAGE_KEYS.CURRENT_USER, null) || this.getItem(STORAGE_KEYS.USER, null);
  }

  getCurrentUser() {
    return this.getUser();
  }

  saveUser(user) {
    this.setItem(STORAGE_KEYS.USER, user);
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    if (user && typeof user.dp === 'number') {
      this.saveDP(user.dp);
    }
    if (user && typeof user.streak === 'number') {
      this.saveStreak(user.streak);
    }
  }

  saveCurrentUser(user) {
    this.saveUser(user);
  }

  isRegistered() {
    const user = this.getUser();
    return Boolean(user && user.isRegistered);
  }

  isLoggedIn() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const session = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      const user = this.getUser();
      if (!user || !user.isRegistered) return false;
      return session === 'true';
    } catch (e) {
      return false;
    }
  }

  setLoggedIn(isLogged) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, isLogged ? 'true' : 'false');
      }
    } catch (e) {}
  }

  getQuestions() {
    return this.getItem(STORAGE_KEYS.QUESTIONS, null);
  }

  saveQuestions(questions) {
    this.setItem(STORAGE_KEYS.QUESTIONS, questions);
  }

  getDecks() {
    return this.getItem(STORAGE_KEYS.DECKS, null);
  }

  saveDecks(decks) {
    this.setItem(STORAGE_KEYS.DECKS, decks);
  }

  getBattles() {
    return this.getItem(STORAGE_KEYS.BATTLES, null);
  }

  saveBattles(battles) {
    this.setItem(STORAGE_KEYS.BATTLES, battles);
  }

  getFriends() {
    return this.getItem(STORAGE_KEYS.FRIENDS, null);
  }

  saveFriends(friends) {
    this.setItem(STORAGE_KEYS.FRIENDS, friends);
  }

  getPendingRequests() {
    return this.getItem(STORAGE_KEYS.PENDING_REQUESTS, null);
  }

  savePendingRequests(requests) {
    this.setItem(STORAGE_KEYS.PENDING_REQUESTS, requests);
  }

  getNotifications() {
    return this.getItem(STORAGE_KEYS.NOTIFICATIONS, null);
  }

  saveNotifications(notifications) {
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  getActivity() {
    return this.getItem(STORAGE_KEYS.ACTIVITY, null);
  }

  saveActivity(activities) {
    this.setItem(STORAGE_KEYS.ACTIVITY, activities);
  }

  getDP() {
    return this.getItem(STORAGE_KEYS.DP, null);
  }

  saveDP(dp) {
    this.setItem(STORAGE_KEYS.DP, dp);
  }

  getStreak() {
    return this.getItem(STORAGE_KEYS.STREAK, null);
  }

  saveStreak(streak) {
    this.setItem(STORAGE_KEYS.STREAK, streak);
  }

  getDeckProgress() {
    return this.getItem(STORAGE_KEYS.DECK_PROGRESS, null);
  }

  saveDeckProgress(progress) {
    this.setItem(STORAGE_KEYS.DECK_PROGRESS, progress);
  }

  getQuestionAnalytics() {
    return this.getItem(STORAGE_KEYS.QUESTION_ANALYTICS, null);
  }

  saveQuestionAnalytics(analytics) {
    this.setItem(STORAGE_KEYS.QUESTION_ANALYTICS, analytics);
  }

  getTheme() {
    try {
      if (typeof localStorage === 'undefined') return 'dark';
      return localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  saveTheme(theme) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        localStorage.setItem('theme', theme);
      }
    } catch (e) {}
  }
}

export const storageService = new StorageService();
export default storageService;
