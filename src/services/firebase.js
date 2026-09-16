import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA_lYH8sOVLUflUNVlltNUvlsHxHaemLbA',
  authDomain: 'kweshun-7b168.firebaseapp.com',
  projectId: 'kweshun-7b168',
  storageBucket: 'kweshun-7b168.firebasestorage.app',
  messagingSenderId: '168582568527',
  appId: '1:168582568527:web:7b11e77f9e76b453a6e83a'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

