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
import { db, auth } from './firebase.js';

class FirestoreService {
  getAuthUid(userId) {
    return userId || auth.currentUser?.uid || null;
  }

  formatError(e, action = 'Operation') {
    console.error(`Firestore ${action} error:`, e);
    if (e?.code === 'permission-denied') {
      return 'Permission denied: Please ensure your Firestore Security Rules in Firebase Console allow read/write for authenticated users.';
    }
    if (e?.code === 'unauthenticated') {
      return 'You must be signed in to perform this action.';
    }
    if (e?.code === 'unavailable') {
      return 'Firestore service is currently unavailable. Please check your internet connection.';
    }
    return e?.message || `${action} failed.`;
  }

  // --- USER PROFILE OPERATIONS ---
  async saveUserProfile(uid, profileData) {
    const effectiveUid = this.getAuthUid(uid);
    if (!effectiveUid) {
      return { error: 'Authentication required to save profile.' };
    }
    try {
      const userRef = doc(db, 'users', effectiveUid);
      const data = {
        ...profileData,
        uid: effectiveUid,
        id: effectiveUid,
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, data, { merge: true });
      return { success: true, user: data };
    } catch (e) {
      return { error: this.formatError(e, 'saveUserProfile') };
    }
  }

  async getUserProfile(uid) {
    const effectiveUid = this.getAuthUid(uid);
    if (!effectiveUid) return null;
    try {
      const userRef = doc(db, 'users', effectiveUid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
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
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      return null;
    } catch (e) {
      console.error('Firestore findUserByUsername error:', e);
      return null;
    }
  }

  // --- SUBJECTS OPERATIONS ---
  async getSubjects(userId) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) return [];
    try {
      const q = query(collection(db, 'subjects'), where('userId', '==', effectiveUid));
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
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) {
      return { error: 'Authentication required to create a subject in Firestore.' };
    }
    try {
      const subjectId = id || ('subj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
      const newSubject = {
        id: subjectId,
        userId: effectiveUid,
        name: name.trim(),
        description: (description || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'subjects', subjectId), newSubject);
      return { success: true, subject: newSubject };
    } catch (e) {
      return { error: this.formatError(e, 'createSubject') };
    }
  }

  async updateSubject(subjectId, updates, userId) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) {
      return { error: 'Authentication required to update subject.' };
    }
    try {
      const subRef = doc(db, 'subjects', subjectId);
      const data = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(subRef, data);
      return { success: true, subject: { id: subjectId, userId: effectiveUid, ...data } };
    } catch (e) {
      return { error: this.formatError(e, 'updateSubject') };
    }
  }

  async deleteSubject(subjectId, userId) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) {
      return { error: 'Authentication required to delete subject.' };
    }
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      // Delete questions belonging to this subject
      const qQuery = query(
        collection(db, 'questions'),
        where('subjectId', '==', subjectId),
        where('userId', '==', effectiveUid)
      );
      const qSnap = await getDocs(qQuery);
      const deletePromises = qSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      return { success: true };
    } catch (e) {
      return { error: this.formatError(e, 'deleteSubject') };
    }
  }

  // --- QUESTIONS OPERATIONS ---
  async getQuestions(userId) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) return [];
    try {
      const q = query(collection(db, 'questions'), where('userId', '==', effectiveUid));
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
    const effectiveUid = this.getAuthUid(questionData.userId);
    if (!effectiveUid) {
      return { error: 'Authentication required to save question in Firestore.' };
    }
    try {
      const qId = questionData.id || ('question_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
      const newQuestion = {
        ...questionData,
        id: qId,
        userId: effectiveUid,
        createdAt: questionData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'questions', qId), newQuestion);
      return { success: true, question: newQuestion };
    } catch (e) {
      return { error: this.formatError(e, 'createQuestion') };
    }
  }

  async updateQuestion(questionId, updates, userId) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) {
      return { error: 'Authentication required to update question in Firestore.' };
    }
    try {
      const qRef = doc(db, 'questions', questionId);
      const data = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(qRef, data);
      return { success: true, question: { id: questionId, userId: effectiveUid, ...data } };
    } catch (e) {
      return { error: this.formatError(e, 'updateQuestion') };
    }
  }

  async deleteQuestion(questionId, userId) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) {
      return { error: 'Authentication required to delete question from Firestore.' };
    }
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      return { success: true };
    } catch (e) {
      return { error: this.formatError(e, 'deleteQuestion') };
    }
  }

  // Real-time Subscriptions
  subscribeSubjects(userId, callback) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) return () => {};
    const q = query(collection(db, 'subjects'), where('userId', '==', effectiveUid));
    return onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      callback(list);
    }, (err) => {
      console.warn('Firestore subjects subscription warning:', err);
    });
  }

  subscribeQuestions(userId, callback) {
    const effectiveUid = this.getAuthUid(userId);
    if (!effectiveUid) return () => {};
    const q = query(collection(db, 'questions'), where('userId', '==', effectiveUid));
    return onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(list);
    }, (err) => {
      console.warn('Firestore questions subscription warning:', err);
    });
  }
}

const firestoreService = new FirestoreService();
export default firestoreService;

