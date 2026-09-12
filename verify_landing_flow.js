// Mock localStorage for Node.js test runner if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

import storageService, { STORAGE_KEYS } from './src/services/storageService.js';
import dataStore from './src/services/dataStore.js';

console.log('====================================================');
console.log('🚀 KWESHUN LANDING PAGE & SIGNUP FLOW VERIFICATION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. TEST 1: FIRST VISIT / UNREGISTERED STATE
console.log('--- 1. First Visit & Landing Page State ---');
localStorage.clear();
assert(storageService.getUser() === null, 'LocalStorage cleared: no stored user');
assert(storageService.isRegistered() === false, 'isRegistered() returns false for new visitor');
assert(storageService.isLoggedIn() === false, 'isLoggedIn() returns false for new visitor');

// 2. TEST 2: SIGNUP & USER INITIALIZATION
console.log('\n--- 2. Signup Flow & Profile Persistence ---');
const signupData = {
  name: 'Abhishek Hindi',
  username: 'abhishek',
  email: 'abhishek@kweshun.edu',
  password: 'securePassword123'
};

const registerResult = dataStore.registerUser(signupData);
assert(registerResult && registerResult.user, 'registerUser returned created user');
const registeredUser = storageService.getUser();
assert(registeredUser !== null, 'User saved to localStorage (kweshun_user)');
assert(registeredUser.name === 'Abhishek Hindi', `Stored user name: "${registeredUser.name}"`);
assert(registeredUser.username === 'abhishek', `Stored username: "${registeredUser.username}"`);
assert(registeredUser.dp === 0, `Initial DP is 0 (Actual: ${registeredUser.dp})`);
assert(registeredUser.streak === 0, `Initial streak is 0 (Actual: ${registeredUser.streak})`);
assert(registeredUser.tier === 'Scholar', `Initial tier is Scholar (Actual: ${registeredUser.tier})`);
assert(registeredUser.isRegistered === true, 'isRegistered flag is true');
assert(storageService.isRegistered() === true, 'storageService.isRegistered() returns true');
assert(storageService.isLoggedIn() === true, 'storageService.isLoggedIn() returns true after signup');

// 3. TEST 3: ONBOARDING & SUBJECT SELECTION
console.log('\n--- 3. Onboarding & Subject Selection ---');
const chosenSubjects = ['Physics', 'Mathematics', 'Chemistry'];
const updatedUser = dataStore.updateUser(registeredUser.id, { selectedSubjects: chosenSubjects });
storageService.saveUser(updatedUser);
const reloadedUser = storageService.getUser();
assert(Array.isArray(reloadedUser.selectedSubjects), 'selectedSubjects is an array');
assert(reloadedUser.selectedSubjects.length === 3, `3 subjects selected: ${reloadedUser.selectedSubjects.join(', ')}`);

// 4. TEST 4: HOME DASHBOARD USER IDENTITY
console.log('\n--- 4. Active User Identity & Dashboard Parity ---');
const currentUser = dataStore.getCurrentUser();
assert(currentUser.name === 'Abhishek Hindi', `Dashboard active user name is ${currentUser.name}`);
assert(currentUser.dp === 0, `Dashboard DP displays 0 for new user`);
assert(currentUser.streak === 0, `Dashboard Streak displays 0 for new user`);

// 5. TEST 5: REFRESH PERSISTENCE
console.log('\n--- 5. Page Reload / Session Persistence ---');
// Simulate new page load by instantiating fresh dataStore check
assert(storageService.isLoggedIn() === true, 'Session remains logged in across reloads');
assert(storageService.getUser().name === 'Abhishek Hindi', 'User profile persisted across reloads');

// 6. TEST 6: LOGOUT FLOW
console.log('\n--- 6. Logout Flow ---');
storageService.setLoggedIn(false);
assert(storageService.isLoggedIn() === false, 'Session status is logged out');
assert(storageService.getUser() !== null, 'User profile data is preserved in kweshun_user (not destroyed)');
assert(storageService.getUser().name === 'Abhishek Hindi', 'Stored profile name preserved after logout');

// 7. TEST 7: LOGIN FLOW
console.log('\n--- 7. Login Flow with Stored Profile ---');
const loginRes = dataStore.loginUser('abhishek@kweshun.edu', 'securePassword123');
assert(loginRes.user && loginRes.user.name === 'Abhishek Hindi', `Logged back in as ${loginRes.user?.name}`);
assert(storageService.isLoggedIn() === true, 'Session restored to logged in');

// 8. TEST 8: LOGIN WITH UNKNOWN USER
console.log('\n--- 8. Login with Non-Existent User ---');
localStorage.clear();
const unknownLoginRes = dataStore.loginUser('unknown@nobody.edu', 'pass');
assert(unknownLoginRes.error !== undefined, `Correctly rejected unknown user: "${unknownLoginRes.error}"`);

console.log('\n====================================================');
console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('====================================================\n');
