import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase.js';

class FirestoreService {
  // --- USER PROFILE OPERATIONS ---
  async saveUserProfile(uid, profileData) {
    try {
      const userRef = doc(db, 'users', uid);
      const data = {
        ...profileData,
        uid,
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, data, { merge: true });
      return { success: true, user: data };
    } catch (e) {
      console.error('Firestore saveUserProfile error:', e);
      return { error: e.message };
    }
  }

  async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.error('Firestore getUserProfile error:', e);
      return null;
    }
  }

  async findUserByUsername(username) {
    try {
      const clean = (username || '').trim().toLowerCase().replace(/^@+/, '');
      if (!clean) return null;
      const q = query(collection(db, 'users'), where('username', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data();
      }
      return null;
    } catch (e) {
      console.error('Firestore findUserByUsername error:', e);
      return null;
    }
  }

  // --- SUBJECTS OPERATIONS ---
  async getSubjects(userId) {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'subjects'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    } catch (e) {
      console.error('Firestore getSubjects error:', e);
      return [];
    }
  }

  async createSubject({ id, userId, name, description = '' }) {
    try {
      const subjectId = id || ('subj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
      const newSubject = {
        id: subjectId,
        userId,
        name: name.trim(),
        description: (description || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'subjects', subjectId), newSubject);
      return { success: true, subject: newSubject };
    } catch (e) {
      console.error('Firestore createSubject error:', e);
      return { error: e.message };
    }
  }

  async updateSubject(subjectId, updates, userId) {
    try {
      const subRef = doc(db, 'subjects', subjectId);
      const data = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(subRef, data);
      return { success: true, subject: { id: subjectId, userId, ...data } };
    } catch (e) {
      console.error('Firestore updateSubject error:', e);
      return { error: e.message };
    }
  }

  async deleteSubject(subjectId, userId) {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      // Delete questions belonging to this subject
      const qQuery = query(
        collection(db, 'questions'),
        where('subjectId', '==', subjectId),
        where('userId', '==', userId)
      );
      const qSnap = await getDocs(qQuery);
      const deletePromises = qSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      return { success: true };
    } catch (e) {
      console.error('Firestore deleteSubject error:', e);
      return { error: e.message };
    }
  }

  // --- QUESTIONS OPERATIONS ---
  async getQuestions(userId) {
    if (!userId) return [];
    try {
      const q = query(collection(db, 'questions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.error('Firestore getQuestions error:', e);
      return [];
    }
  }

  async createQuestion(questionData) {
    try {
      const qId = questionData.id || ('question_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
      const newQuestion = {
        ...questionData,
        id: qId,
        createdAt: questionData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'questions', qId), newQuestion);
      return { success: true, question: newQuestion };
    } catch (e) {
      console.error('Firestore createQuestion error:', e);
      return { error: e.message };
    }
  }

  async updateQuestion(questionId, updates, userId) {
    try {
      const qRef = doc(db, 'questions', questionId);
      const data = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(qRef, data);
      return { success: true, question: { id: questionId, userId, ...data } };
    } catch (e) {
      console.error('Firestore updateQuestion error:', e);
      return { error: e.message };
    }
  }

  async deleteQuestion(questionId, userId) {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      return { success: true };
    } catch (e) {
      console.error('Firestore deleteQuestion error:', e);
      return { error: e.message };
    }
  }

  // Real-time Subscriptions
  subscribeSubjects(userId, callback) {
    if (!userId) return () => {};
    const q = query(collection(db, 'subjects'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      callback(list);
    }, (err) => {
      console.warn('Firestore subjects subscription error:', err);
    });
  }

  subscribeQuestions(userId, callback) {
    if (!userId) return () => {};
    const q = query(collection(db, 'questions'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(list);
    }, (err) => {
      console.warn('Firestore questions subscription error:', err);
    });
  }
}

const firestoreService = new FirestoreService();
export default firestoreService;

