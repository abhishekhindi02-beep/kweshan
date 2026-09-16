import {
  initialUsers,
  initialSubjects,
  initialRepoQuestions
} from './mockData.js';
import storageService from './storageService.js';

const STORAGE_KEY = 'kweshun_repo_store_v2';

export function normalizeQuestion(q) {
  if (!q) return null;
  const promptText = (q.questionText || q.prompt || q.text || q.question || '').trim();
  
  const images = Array.isArray(q.attachments?.images) 
    ? q.attachments.images 
    : (q.image || q.imageUrl ? [q.image || q.imageUrl] : []);
  const drawings = Array.isArray(q.attachments?.drawings) 
    ? q.attachments.drawings 
    : (q.drawing || q.figure ? [q.drawing || q.figure] : []);
  const equations = Array.isArray(q.attachments?.equations) 
    ? q.attachments.equations 
    : (Array.isArray(q.equations) ? q.equations : (q.equation ? [q.equation] : []));

  return {
    id: q.id || `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: q.userId || q.authorId || 'user_1',
    subjectId: q.subjectId || 'subj_physics',
    questionText: promptText,
    topic: q.topic || promptText.slice(0, 45) || 'Academic Concept',
    difficulty: q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) : 'Medium',
    notes: q.notes || q.explanation || q.canonicalSolution || '',
    citation: q.citation || q.citations || '',
    attachments: {
      images,
      drawings,
      equations
    },
    createdAt: q.createdAt || new Date().toISOString(),
    updatedAt: q.updatedAt || q.createdAt || new Date().toISOString()
  };
}

class DataStore {
  constructor() {
    this.subscribers = new Set();
    this.loadState();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedUsers = storageService.getUsers();
        const savedUser = storageService.getUser();

        let loadedUsers = [];
        if (Array.isArray(savedUsers) && savedUsers.length > 0) {
          loadedUsers = savedUsers;
        } else if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.users) && parsed.users.length > 0) {
            loadedUsers = parsed.users;
          }
        }

        // Keep real registered users only (filter out dummy mock 'user_1' if it has no password or old mock email)
        this.users = loadedUsers.filter(u => u && u.id && u.id !== 'user_1');

        if (saved) {
          const parsed = JSON.parse(saved);
          this.currentUserId = savedUser?.id || (this.users[0] ? this.users[0].id : null);

          // Only keep subjects and questions belonging to real user IDs
          const rawSubjects = Array.isArray(parsed.subjects) ? parsed.subjects : [];
          this.subjects = rawSubjects.filter(s => s && s.userId && s.userId !== 'user_1');

          const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
          this.questions = rawQuestions
            .filter(q => q && q.userId && q.userId !== 'user_1')
            .map(normalizeQuestion)
            .filter(Boolean);

          return;
        }
      }
    } catch (e) {
      console.error('DataStore: Failed to load state from localStorage', e);
    }

    this.resetToDefaults(false);
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const state = {
          users: this.users,
          currentUserId: this.currentUserId,
          subjects: this.subjects,
          questions: this.questions
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        storageService.saveUsers(this.users);

        const currentUser = this.getCurrentUser();
        if (currentUser) {
          storageService.saveUser(currentUser);
        }
      }
    } catch (e) {
      console.error('DataStore: Failed to save state to localStorage', e);
    }
    this.notify();
  }

  resetToDefaults(save = true) {
    this.users = [];
    this.currentUserId = null;
    this.subjects = [];
    this.questions = [];
    if (save) this.saveState();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb());
  }

  // --- Current User & Authentication ---
  getCurrentUser() {
    if (!this.currentUserId) return this.users[0] || null;
    return this.users.find(u => u.id === this.currentUserId) || this.users[0] || null;
  }

  setCurrentUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUserId = userId;
      storageService.saveUser(user);
      storageService.setLoggedIn(true);
      this.saveState();
    }
  }

  registerUser({ name, username, email, password, avatar }) {
    const cleanName = (name || '').trim();
    const cleanUsername = (username || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/^@+/, '') || cleanName.toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanName) {
      return { error: 'Please provide your full name.' };
    }
    if (!cleanUsername) {
      return { error: 'Please choose an academic username.' };
    }
    if (!cleanEmail) {
      return { error: 'Please provide a valid email address.' };
    }

    // Check if user already exists
    const existing = this.users.find(u => 
      (u.email && u.email.trim().toLowerCase() === cleanEmail) || 
      (u.username && u.username.trim().toLowerCase().replace(/^@+/, '') === cleanUsername)
    );

    if (existing) {
      return { error: 'An account with this email or username already exists.' };
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      username: cleanUsername,
      handle: `@${cleanUsername}`,
      email: cleanEmail,
      password: password || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      institution: 'Academic Scholar Guild',
      bio: 'Knowledge repository curator on Kweshun.',
      selectedSubjects: [],
      isRegistered: true,
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    this.users.unshift(newUser);
    this.currentUserId = newUser.id;
    this.saveState();
    storageService.saveUser(newUser);
    storageService.setLoggedIn(true);
    return { success: true, user: newUser };
  }

  loginUser(identifier, password) {
    const clean = (identifier || '').trim().toLowerCase();
    const cleanNoAt = clean.replace(/^@+/, '');

    if (!clean) {
      return { error: 'Please enter your email or username.' };
    }

    const user = this.users.find(u => 
      (u.email && u.email.trim().toLowerCase() === clean) || 
      (u.username && u.username.trim().toLowerCase().replace(/^@+/, '') === cleanNoAt) ||
      (u.handle && u.handle.trim().toLowerCase().replace(/^@+/, '') === cleanNoAt)
    );

    if (!user) {
      return { 
        error: 'No Kweshun profile found. Please check your credentials or create a free account.',
        notFound: true 
      };
    }

    if (user.password && password && user.password !== password) {
      return { error: 'Invalid password. Please check your credentials.' };
    }

    this.currentUserId = user.id;
    this.saveState();
    storageService.saveUser(user);
    storageService.setLoggedIn(true);
    return { success: true, user };
  }

  logoutUser() {
    storageService.setLoggedIn(false);
    this.notify();
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveState();
      return this.users[idx];
    }
    return null;
  }

  // --- SUBJECTS MANAGEMENT ---
  getSubjectsForUser(userId = this.currentUserId) {
    return this.subjects
      .filter(s => s && s.userId === userId)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  getSubjectById(subjectId, userId = this.currentUserId) {
    return this.subjects.find(s => s && s.id === subjectId && (!userId || s.userId === userId)) || null;
  }

  createSubject({ userId = this.currentUserId, name, description = '' }) {
    const cleanName = (name || '').trim();
    if (!cleanName) {
      return { error: 'Subject name is required.' };
    }

    // Check for duplicate subject name for the same user
    const existing = this.subjects.find(
      s => s.userId === userId && s.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      return { error: `A subject named "${cleanName}" already exists in your repository.` };
    }

    const newSubject = {
      id: `subj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      name: cleanName,
      description: (description || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.subjects.unshift(newSubject);
    this.saveState();
    return { subject: newSubject };
  }

  updateSubject(subjectId, { name, description }, userId = this.currentUserId) {
    const idx = this.subjects.findIndex(s => s.id === subjectId && s.userId === userId);
    if (idx === -1) {
      return { error: 'Subject not found.' };
    }

    const cleanName = (name || '').trim();
    if (!cleanName) {
      return { error: 'Subject name is required.' };
    }

    // Check duplicate name on other subjects
    const duplicate = this.subjects.find(
      s => s.id !== subjectId && s.userId === userId && s.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      return { error: `Another subject named "${cleanName}" already exists.` };
    }

    this.subjects[idx] = {
      ...this.subjects[idx],
      name: cleanName,
      description: typeof description === 'string' ? description.trim() : this.subjects[idx].description,
      updatedAt: new Date().toISOString()
    };

    this.saveState();
    return { subject: this.subjects[idx] };
  }

  deleteSubject(subjectId, userId = this.currentUserId) {
    const beforeCount = this.subjects.length;
    this.subjects = this.subjects.filter(s => !(s.id === subjectId && s.userId === userId));
    
    // Also cascade delete all questions under this subject
    this.questions = this.questions.filter(q => !(q.subjectId === subjectId && q.userId === userId));

    if (this.subjects.length !== beforeCount) {
      this.saveState();
      return { success: true };
    }
    return { error: 'Subject not found.' };
  }

  // --- QUESTIONS MANAGEMENT ---
  getQuestionsForUser(userId = this.currentUserId, options = {}) {
    const { subjectId, search, sort = 'recent', difficulty } = options;

    let list = this.questions.filter(q => q && q.userId === userId);

    if (subjectId && subjectId !== 'all') {
      list = list.filter(q => q.subjectId === subjectId);
    }

    if (difficulty && difficulty !== 'all') {
      list = list.filter(q => q.difficulty?.toLowerCase() === difficulty.toLowerCase());
    }

    if (search && search.trim()) {
      const qLower = search.toLowerCase().trim();
      list = list.filter(q => {
        const subject = this.getSubjectById(q.subjectId, userId);
        return (
          (q.questionText || '').toLowerCase().includes(qLower) ||
          (q.topic || '').toLowerCase().includes(qLower) ||
          (q.notes || '').toLowerCase().includes(qLower) ||
          (q.citation || '').toLowerCase().includes(qLower) ||
          (subject?.name || '').toLowerCase().includes(qLower)
        );
      });
    }

    // Sorting
    list = [...list];
    if (sort === 'updated') {
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    } else if (sort === 'alphabetical') {
      list.sort((a, b) => (a.topic || a.questionText || '').localeCompare(b.topic || b.questionText || ''));
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // 'recent' / 'newest' (default)
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Attach subject metadata
    return list.map(q => {
      const subj = this.getSubjectById(q.subjectId, userId);
      return {
        ...q,
        subjectName: subj?.name || 'Unassigned Subject'
      };
    });
  }

  getQuestionById(questionId, userId = this.currentUserId) {
    const question = this.questions.find(q => q.id === questionId && (!userId || q.userId === userId));
    if (!question) return null;
    const subj = this.getSubjectById(question.subjectId, question.userId);
    return {
      ...question,
      subjectName: subj?.name || 'Unassigned Subject'
    };
  }

  createQuestion({
    userId = this.currentUserId,
    subjectId,
    questionText,
    topic,
    difficulty = 'Medium',
    notes = '',
    citation = '',
    attachments = {}
  }) {
    const text = (questionText || '').trim();
    if (!text) {
      return { error: 'Question text is required.' };
    }

    if (!subjectId) {
      return { error: 'Please select a valid subject for this question.' };
    }

    const cleanTopic = (topic || '').trim() || text.slice(0, 45);

    const newQuestion = normalizeQuestion({
      id: `question_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      subjectId,
      questionText: text,
      topic: cleanTopic,
      difficulty: difficulty || 'Medium',
      notes: (notes || '').trim(),
      citation: (citation || '').trim(),
      attachments: {
        images: Array.isArray(attachments?.images) ? attachments.images : [],
        drawings: Array.isArray(attachments?.drawings) ? attachments.drawings : [],
        equations: Array.isArray(attachments?.equations) ? attachments.equations : []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.questions.unshift(newQuestion);

    // Update parent subject's updatedAt
    const subjIdx = this.subjects.findIndex(s => s.id === subjectId && s.userId === userId);
    if (subjIdx !== -1) {
      this.subjects[subjIdx] = {
        ...this.subjects[subjIdx],
        updatedAt: new Date().toISOString()
      };
    }

    this.saveState();
    return { question: newQuestion };
  }

  updateQuestion(questionId, updates, userId = this.currentUserId) {
    const idx = this.questions.findIndex(q => q.id === questionId && q.userId === userId);
    if (idx === -1) {
      return { error: 'Question not found.' };
    }

    const existing = this.questions[idx];
    const newText = typeof updates.questionText === 'string' ? updates.questionText.trim() : existing.questionText;
    if (!newText) {
      return { error: 'Question text cannot be empty.' };
    }

    const updated = normalizeQuestion({
      ...existing,
      ...updates,
      questionText: newText,
      topic: updates.topic !== undefined ? (updates.topic || '').trim() || newText.slice(0, 45) : existing.topic,
      notes: updates.notes !== undefined ? (updates.notes || '').trim() : existing.notes,
      citation: updates.citation !== undefined ? (updates.citation || '').trim() : existing.citation,
      attachments: updates.attachments || existing.attachments,
      updatedAt: new Date().toISOString()
    });

    this.questions[idx] = updated;

    // Update parent subject's updatedAt
    const subjIdx = this.subjects.findIndex(s => s.id === updated.subjectId && s.userId === userId);
    if (subjIdx !== -1) {
      this.subjects[subjIdx] = {
        ...this.subjects[subjIdx],
        updatedAt: new Date().toISOString()
      };
    }

    this.saveState();
    return { question: updated };
  }

  deleteQuestion(questionId, userId = this.currentUserId) {
    const target = this.questions.find(q => q.id === questionId && q.userId === userId);
    if (!target) {
      return { error: 'Question not found.' };
    }

    this.questions = this.questions.filter(q => !(q.id === questionId && q.userId === userId));

    // Update parent subject's updatedAt
    if (target.subjectId) {
      const subjIdx = this.subjects.findIndex(s => s.id === target.subjectId && s.userId === userId);
      if (subjIdx !== -1) {
        this.subjects[subjIdx] = {
          ...this.subjects[subjIdx],
          updatedAt: new Date().toISOString()
        };
      }
    }

    this.saveState();
    return { success: true };
  }

  // --- REPOSITORY STATS & SEARCH ---
  getStats(userId = this.currentUserId) {
    return this.getRepositoryStats(userId);
  }

  getRepositoryStats(userId = this.currentUserId) {
    const userSubjects = this.getSubjectsForUser(userId);
    const userQuestions = this.getQuestionsForUser(userId);

    const totalSubjects = userSubjects.length;
    const totalQuestions = userQuestions.length;

    const recentQuestions = [...userQuestions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentlyUpdated = [...userQuestions]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);

    const subjectsWithCounts = userSubjects.map(s => {
      const count = userQuestions.filter(q => q.subjectId === s.id).length;
      return {
        ...s,
        questionCount: count
      };
    });

    return {
      totalSubjects,
      totalQuestions,
      recentQuestions,
      recentlyUpdated,
      subjectsWithCounts
    };
  }

  globalSearch(query, userId = this.currentUserId) {
    const qLower = (query || '').toLowerCase().trim();
    if (!qLower) {
      return { subjects: [], questions: [] };
    }

    const matchingSubjects = this.getSubjectsForUser(userId).filter(
      s => s.name.toLowerCase().includes(qLower) || (s.description || '').toLowerCase().includes(qLower)
    );

    const matchingQuestions = this.getQuestionsForUser(userId, { search: query });

    return {
      subjects: matchingSubjects,
      questions: matchingQuestions
    };
  }
}

const dataStore = new DataStore();
export default dataStore;
