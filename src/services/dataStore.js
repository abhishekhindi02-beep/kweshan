import {
  initialUsers,
  initialDecks,
  initialQuestions,
  initialBattles,
  initialIncomingInvites,
  initialBattleLogs,
  initialFriendRequests,
  initialFriends,
  initialNotifications,
  initialActivities,
  initialDPTransactions
} from './mockData.js';
import { calculateQualityScores } from './qualityScorer.js';
import storageService, { STORAGE_KEYS } from './storageService.js';
import { extractKeyConcepts } from './answerEvaluator.js';

const STORAGE_KEY = 'kweshun_multi_user_store_v4';

export function normalizeQuestion(q) {
  if (!q) return null;
  const promptText = (q.prompt || q.text || q.question || '').trim();
  
  // 1. Determine question type ("long-form" vs "mcq")
  let type = q.type;
  if (!type) {
    const hasAttachments = Boolean(q.image || q.drawing || q.figure || (Array.isArray(q.equations) && q.equations.length > 0));
    const hasOptions = Array.isArray(q.options) && q.options.length > 0;
    if (q.source === 'user' || hasAttachments || !hasOptions) {
      type = 'long-form';
    } else {
      type = 'mcq';
    }
  }

  // 2. Determine source ("user" vs "curriculum")
  const source = q.source || (q.authorId && q.authorId.startsWith('user_') && q.id && q.id.startsWith('user-') ? 'user' : (q.authorId === 'curriculum' ? 'curriculum' : (type === 'long-form' && !q.id?.startsWith('Q-') ? 'user' : 'curriculum')));

  // 3. Normalize Attachments
  const images = Array.isArray(q.attachments?.images) 
    ? q.attachments.images 
    : (q.image || q.imageUrl ? [q.image || q.imageUrl] : []);
  const drawings = Array.isArray(q.attachments?.drawings) 
    ? q.attachments.drawings 
    : (q.drawing || q.figure ? [q.drawing || q.figure] : []);
  const equations = Array.isArray(q.attachments?.equations) 
    ? q.attachments.equations 
    : (Array.isArray(q.equations) ? q.equations : (q.equation ? [q.equation] : []));

  const attachments = {
    images,
    drawings,
    equations
  };

  let canonicalStatus = 'Live';
  const rawStatus = (q.status || 'Live').toLowerCase();
  if (rawStatus === 'draft') canonicalStatus = 'Draft';
  else if (rawStatus === 'pending' || rawStatus === 'pending review') canonicalStatus = 'Pending Review';
  else canonicalStatus = 'Live';

  const qualityScores = q.qualityScores || calculateQualityScores(q);

  if (type === 'long-form') {
    // LONG-FORM QUESTION MODEL (NO MCQ options, NO correctAnswerIndex)
    return {
      id: q.id || `user-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'long-form',
      source,
      authorId: q.authorId || 'user_1',
      authorName: q.authorName || 'Scholar',
      deckId: q.deckId || 'deck_1',
      deckName: q.deckName || 'AP Physics 1: Mechanics',
      category: q.category || 'Science',
      topic: q.topic || promptText.slice(0, 45) || 'Academic Concept',
      text: promptText,
      prompt: promptText,
      explanation: q.explanation || q.canonicalSolution || 'Detailed academic derivation and proof.',
      canonicalSolution: q.canonicalSolution || q.explanation || 'Detailed academic derivation and proof.',
      citation: q.citation || q.citations || 'Academic Standard Reference',
      citations: q.citations || q.citation || 'Academic Standard Reference',
      difficulty: q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) : 'Medium',
      status: canonicalStatus,
      attachments,
      // Backward compatibility fields
      image: images[0] || null,
      drawing: drawings[0] || null,
      equations,
      expectedConcepts: q.expectedConcepts || extractKeyConcepts(q),
      requiredFormulas: q.requiredFormulas || equations,
      tags: Array.isArray(q.tags) ? q.tags : ['Academic', 'Long-form'],
      plays: q.plays ?? 0,
      accuracy: q.accuracy ?? 75,
      dpEarned: q.dpEarned ?? (canonicalStatus === 'Live' ? 30 : 0),
      qualityScores,
      createdAt: q.createdAt || new Date().toISOString()
    };
  }

  // MULTIPLE CHOICE QUESTION MODEL
  let correctIdx = typeof q.correctAnswerIndex === 'number' 
    ? q.correctAnswerIndex 
    : (typeof q.correctIndex === 'number' ? q.correctIndex : 0);

  const formattedOptions = Array.isArray(q.options) && q.options.length > 0 ? q.options.map((opt, i) => {
    if (typeof opt === 'string') {
      return {
        id: `opt_${i + 1}`,
        text: opt,
        isCorrect: i === correctIdx
      };
    }
    const isCorrect = typeof opt.isCorrect === 'boolean' ? opt.isCorrect : (i === correctIdx);
    if (isCorrect) correctIdx = i;
    return {
      id: opt.id || `opt_${i + 1}`,
      text: opt.text || '',
      isCorrect
    };
  }) : [
    { id: 'opt_1', text: 'Option A', isCorrect: true },
    { id: 'opt_2', text: 'Option B', isCorrect: false },
    { id: 'opt_3', text: 'Option C', isCorrect: false },
    { id: 'opt_4', text: 'Option D', isCorrect: false }
  ];

  return {
    id: q.id || `Q-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'mcq',
    source: 'curriculum',
    authorId: q.authorId || 'curriculum',
    authorName: q.authorName || 'Curriculum Council',
    deckId: q.deckId || 'deck_1',
    deckName: q.deckName || 'General Academic Deck',
    category: q.category || 'Science',
    topic: q.topic || promptText.slice(0, 45) || 'Curriculum Concept',
    text: promptText,
    prompt: promptText,
    options: formattedOptions,
    correctAnswerIndex: correctIdx,
    correctIndex: correctIdx,
    explanation: q.explanation || 'According to standard curriculum principles.',
    citation: q.citation || q.citations || 'Curriculum Standard Reference',
    citations: q.citations || q.citation || 'Curriculum Standard Reference',
    difficulty: q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) : 'Medium',
    status: canonicalStatus,
    attachments: { images: [], drawings: [], equations: [] },
    tags: Array.isArray(q.tags) ? q.tags : ['Curriculum', 'MCQ'],
    plays: q.plays ?? 0,
    accuracy: q.accuracy ?? 70,
    dpEarned: q.dpEarned ?? 0,
    qualityScores,
    createdAt: q.createdAt || new Date().toISOString()
  };
}

export function validateQuestionBank(questions) {
  if (!Array.isArray(questions)) return [];
  const seenIds = new Set();
  const seenPrompts = new Set();
  const validated = [];

  for (const raw of questions) {
    if (!raw) continue;
    const q = normalizeQuestion(raw);
    if (!q || !q.id) continue;

    const promptKey = (q.prompt || q.text || '').trim().toLowerCase();

    // Check duplicate ID
    if (seenIds.has(q.id)) {
      // If exact same prompt as well, skip duplicate
      if (promptKey && seenPrompts.has(promptKey)) {
        continue;
      }
      // If distinct question with accidental duplicate ID, make ID unique
      q.id = `${q.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    seenIds.add(q.id);
    if (promptKey) seenPrompts.add(promptKey);
    validated.push(q);
  }

  return validated;
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
        const savedUser = storageService.getUser();

        if (saved) {
          const parsed = JSON.parse(saved);
          this.users = parsed.users || initialUsers;
          
          if (savedUser) {
            const idx = this.users.findIndex(u => u.id === savedUser.id);
            if (idx >= 0) {
              this.users[idx] = { ...this.users[idx], ...savedUser };
            } else {
              this.users.unshift(savedUser);
            }
          }

          this.currentUserId = parsed.currentUserId || (savedUser?.id || this.users[0]?.id || 'user_1');
          this.decks = parsed.decks || initialDecks;
          this.questions = validateQuestionBank(parsed.questions || initialQuestions);
          this.battles = parsed.battles || initialBattles;
          this.incomingInvites = parsed.incomingInvites || initialIncomingInvites;
          this.battleLogs = parsed.battleLogs || initialBattleLogs;
          this.friendRequests = parsed.friendRequests || initialFriendRequests;
          this.friends = parsed.friends || initialFriends;
          this.notifications = parsed.notifications || initialNotifications;
          this.activities = parsed.activities || initialActivities;
          this.dpTransactions = parsed.dpTransactions || initialDPTransactions;
          return;
        }
      }
    } catch (e) {
      console.error('DataStore: Failed to load state from localStorage', e);
    }

    // Default initialization
    this.resetToDefaults(false);
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const state = {
          users: this.users,
          currentUserId: this.currentUserId,
          decks: this.decks,
          questions: this.questions,
          battles: this.battles,
          incomingInvites: this.incomingInvites,
          battleLogs: this.battleLogs,
          friendRequests: this.friendRequests,
          friends: this.friends,
          notifications: this.notifications,
          activities: this.activities,
          dpTransactions: this.dpTransactions
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

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
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.currentUserId = 'user_1';
    this.decks = JSON.parse(JSON.stringify(initialDecks));
    this.questions = initialQuestions.map(normalizeQuestion);
    this.battles = JSON.parse(JSON.stringify(initialBattles));
    this.incomingInvites = JSON.parse(JSON.stringify(initialIncomingInvites));
    this.battleLogs = JSON.parse(JSON.stringify(initialBattleLogs));
    this.friendRequests = JSON.parse(JSON.stringify(initialFriendRequests));
    this.friends = JSON.parse(JSON.stringify(initialFriends));
    this.notifications = JSON.parse(JSON.stringify(initialNotifications));
    this.activities = JSON.parse(JSON.stringify(initialActivities));
    this.dpTransactions = JSON.parse(JSON.stringify(initialDPTransactions));
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
    return this.users.find(u => u.id === this.currentUserId) || this.users[0];
  }

  setCurrentUser(userId) {
    if (this.users.some(u => u.id === userId)) {
      this.currentUserId = userId;
      const user = this.getCurrentUser();
      storageService.saveUser(user);
      storageService.setLoggedIn(true);
      this.saveState();
    }
  }

  registerUser({ name, username, email, password, avatar, selectedSubjects }) {
    const cleanUsername = username ? username.toLowerCase().replace(/\s+/g, '_').replace('@', '') : name.toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = email ? email.toLowerCase().trim() : `${cleanUsername}@kweshun.edu`;
    
    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      handle: `@${cleanUsername}`,
      email: cleanEmail,
      password: password || 'pass123',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      level: 1,
      tier: 'Scholar',
      rank: 'Scholar Tier',
      institution: 'Academic Scholar Guild',
      dp: 0,
      streak: 0,
      lastActiveDate: new Date().toISOString(),
      wins: 0,
      losses: 0,
      totalBattles: 0,
      score: 0,
      accuracy: 0,
      weeklyChange: 0,
      questionsAuthored: 0,
      pendingReviewCount: 0,
      monthlyRank: this.users.length + 1,
      totalPlayers: this.users.length + 1,
      onlineStatus: 'online',
      bio: 'Competitive scholar on Kweshun.',
      royaltiesEarned: 0,
      globalAccuracy: 0,
      mostPlayedDeck: 'Science',
      selectedSubjects: selectedSubjects || ['Physics', 'Mathematics'],
      deckProgress: {},
      isRegistered: true,
      onboardingCompleted: false, // New user needs welcome onboarding
      createdAt: new Date().toISOString()
    };

    this.users.unshift(newUser);
    this.currentUserId = newUser.id;
    storageService.saveUser(newUser);
    storageService.setLoggedIn(true);
    this.saveState();
    return { user: newUser };
  }

  loginUser(identifier, password) {
    const clean = (identifier || '').toLowerCase().trim();
    const cleanNoAt = clean.replace('@', '');
    const user = this.users.find(u => 
      (u.email && u.email.toLowerCase() === clean) || 
      (u.username && u.username.toLowerCase() === cleanNoAt) ||
      (u.handle && u.handle.toLowerCase() === clean) ||
      (u.name && u.name.toLowerCase() === clean)
    );

    if (user) {
      this.currentUserId = user.id;
      storageService.saveUser(user);
      storageService.setLoggedIn(true);
      this.saveState();
      return { user };
    }

    return { error: 'No Kweshun profile found. Please sign up or select a Demo Scholar.' };
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

  // --- DP Ledger System ---
  addDPTransaction(userId, amount, reason, sourceType, sourceId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    const newDP = Math.max(0, (user.dp || 0) + amount);
    const scoreDiff = amount > 0 ? amount : 0;
    const newScore = Math.max(0, (user.score || 0) + scoreDiff);

    user.dp = newDP;
    user.score = newScore;
    user.weeklyChange = (user.weeklyChange || 0) + amount;

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      amount,
      reason,
      sourceType,
      sourceId,
      createdAt: new Date().toISOString()
    };
    this.dpTransactions.unshift(tx);
    this.saveState();
    return tx;
  }

  // --- Leaderboard Calculation ---
  getLeaderboard(timeframe = 'monthly') {
    const sorted = [...this.users].sort((a, b) => {
      const scoreA = timeframe === 'monthly' ? (a.score || a.dp) : a.dp;
      const scoreB = timeframe === 'monthly' ? (b.score || b.dp) : b.dp;
      if (scoreB !== scoreA) return scoreB - scoreA;
      const winRateA = a.totalBattles > 0 ? (a.wins / a.totalBattles) : 0;
      const winRateB = b.totalBattles > 0 ? (b.wins / b.totalBattles) : 0;
      return winRateB - winRateA;
    });

    return sorted.map((user, idx) => ({
      rank: idx + 1,
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      tier: user.tier,
      wins: user.wins || 0,
      losses: user.losses || 0,
      totalBattles: user.totalBattles || 0,
      winRate: user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0,
      score: user.score || user.dp || 0,
      dp: user.dp || 0,
      subject: user.selectedSubjects?.[0] || 'Academic General',
      isCurrentUser: user.id === this.currentUserId
    }));
  }

  // --- User-Specific Decks & Mastery ---
  getDecksForUser(userId = null) {
    const targetUserId = userId || this.currentUserId;
    const user = this.users.find(u => u.id === targetUserId);

    return this.decks.map((deck) => {
      let mastery = 0;
      if (user?.deckProgress && typeof user.deckProgress[deck.id] === 'number') {
        mastery = user.deckProgress[deck.id];
      } else if (user?.isRegistered && user?.dp === 0 && !user.onboardingCompleted) {
        mastery = 0;
      } else {
        mastery = deck.mastery || deck.progress || 0;
      }

      return {
        ...deck,
        mastery,
        progress: mastery
      };
    });
  }

  updateDeckMastery(deckId, increasePercentage = 10, userId = null) {
    const targetUserId = userId || this.currentUserId;
    const user = this.users.find(u => u.id === targetUserId);
    if (!user) return null;

    if (!user.deckProgress) user.deckProgress = {};
    const current = user.deckProgress[deckId] || 0;
    const newMastery = Math.min(100, Math.max(0, current + increasePercentage));
    user.deckProgress[deckId] = newMastery;

    const deck = this.decks.find(d => d.id === deckId);
    if (deck) {
      deck.mastery = newMastery;
      deck.progress = newMastery;
    }
    this.saveState();
    return deck;
  }

  // --- Questions CRUD & Long-Form Management ---
  getQuestions(filters = {}) {
    let list = [...this.questions];
    if (filters.authorId) {
      list = list.filter(q => q.authorId === filters.authorId);
    }
    if (filters.deckId && filters.deckId !== 'all') {
      list = list.filter(q => q.deckId === filters.deckId);
    }
    if (filters.status && filters.status !== 'all' && filters.status !== 'All') {
      const target = filters.status.toLowerCase();
      list = list.filter(q => {
        const s = (q.status || '').toLowerCase();
        if (target === 'approved' || target === 'live') return s === 'live' || s === 'approved';
        if (target === 'pending' || target === 'pending review') return s === 'pending' || s === 'pending review';
        if (target === 'draft') return s === 'draft';
        return s === target;
      });
    }
    if (filters.difficulty && filters.difficulty !== 'all' && filters.difficulty !== 'All') {
      list = list.filter(q => (q.difficulty || '').toLowerCase() === filters.difficulty.toLowerCase());
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(q =>
        (q.text || '').toLowerCase().includes(s) ||
        (q.prompt || '').toLowerCase().includes(s) ||
        (q.topic || '').toLowerCase().includes(s) ||
        (q.deckName || '').toLowerCase().includes(s) ||
        (q.citations && q.citations.toLowerCase().includes(s))
      );
    }
    return list;
  }

  getQuestionById(id) {
    return this.questions.find(q => q.id === id) || null;
  }

  // --- Unique Question Selection for Deck Practice Sessions ---
  getPracticeQuestions(deckId, count = 5) {
    const validQuestions = validateQuestionBank(this.questions);

    // Filter candidate questions by deckId or deckName
    let candidates = validQuestions.filter(q => 
      q && q.status === 'Live' && (q.deckId === deckId || q.deckName === deckId)
    );

    // Fallback if no questions are mapped directly to this deckId
    if (candidates.length === 0) {
      const deck = this.decks.find(d => d.id === deckId);
      if (deck?.category) {
        candidates = validQuestions.filter(q => q && q.status === 'Live' && q.category === deck.category);
      }
      if (candidates.length === 0) {
        candidates = validQuestions.filter(q => q && q.status === 'Live');
      }
    }

    // Deduplicate candidates by unique question ID
    const uniqueMap = new Map();
    candidates.forEach(q => {
      if (q && q.id && !uniqueMap.has(q.id)) {
        uniqueMap.set(q.id, q);
      }
    });

    const uniqueCandidates = Array.from(uniqueMap.values());

    // Prioritization: prioritize unpracticed questions, then lower play counts
    const scored = uniqueCandidates.map(q => {
      let priority = 100;
      if (q.plays > 0) priority -= Math.min(50, q.plays * 2);
      // Give authored long-form questions equal prominent rotation
      if (q.type === 'long-form') priority += 5;
      return { q, score: priority + Math.random() * 8 };
    });

    scored.sort((a, b) => b.score - a.score);

    // Strictly enforce UNIQUE question IDs in this session
    const selected = [];
    const usedIds = new Set();
    for (const item of scored) {
      if (!usedIds.has(item.q.id)) {
        usedIds.add(item.q.id);
        selected.push(item.q);
        if (selected.length >= count) break;
      }
    }

    return selected;
  }

  createQuestion(questionData) {
    const authorId = questionData.authorId || this.currentUserId;
    const user = this.getCurrentUser();
    const qualityScores = calculateQualityScores(questionData);

    const rawStatus = (questionData.status || 'Draft').toLowerCase();
    let canonicalStatus = 'Draft';
    if (rawStatus === 'live' || rawStatus === 'approved') {
      canonicalStatus = 'Live';
    } else if (rawStatus === 'pending' || rawStatus === 'pending review') {
      canonicalStatus = 'Pending Review';
    }

    // User-authored questions are strictly LONG-FORM with no MCQ options
    const newQuestion = normalizeQuestion({
      id: `user-q-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'long-form',
      source: 'user',
      authorId,
      authorName: questionData.authorName || user?.name || 'Scholar',
      deckId: questionData.deckId || 'deck_1',
      deckName: questionData.deckName || 'AP Physics 1: Mechanics',
      category: questionData.category || 'Science',
      topic: questionData.topic || questionData.prompt?.slice(0, 45) || 'Academic Concept',
      text: questionData.prompt || questionData.text,
      prompt: questionData.prompt || questionData.text,
      explanation: questionData.explanation || '',
      canonicalSolution: questionData.canonicalSolution || questionData.explanation || '',
      citation: questionData.citation || questionData.citations || '',
      citations: questionData.citations || questionData.citation || '',
      difficulty: questionData.difficulty || 'Medium',
      tags: questionData.tags || ['Academic', 'Long-form'],
      image: questionData.image || null,
      drawing: questionData.drawing || null,
      equations: questionData.equations || [],
      attachments: {
        images: questionData.image ? [questionData.image] : [],
        drawings: questionData.drawing ? [questionData.drawing] : [],
        equations: questionData.equations || []
      },
      status: canonicalStatus,
      qualityScores,
      dpEarned: canonicalStatus === 'Live' ? 30 : 0,
      createdAt: new Date().toISOString()
    });

    this.questions.unshift(newQuestion);

    // If published Live, award +30 DP
    if (canonicalStatus === 'Live') {
      this.addDPTransaction(
        authorId,
        30,
        `Publication Royalty for "${newQuestion.topic}"`,
        'question',
        newQuestion.id
      );

      this.addActivity(
        authorId,
        'question_published',
        'Long-Form Question Published',
        `"${newQuestion.topic}" published live (+30 DP).`,
        '#0df2c9',
        'CheckCircle2',
        30
      );

      if (user) {
        user.questionsAuthored = (user.questionsAuthored || 0) + 1;
        user.royaltiesEarned = (user.royaltiesEarned || 0) + 30;
      }
    } else if (canonicalStatus === 'Pending Review') {
      this.addActivity(
        authorId,
        'question_submitted',
        'Question Submitted for Peer Review',
        `"${newQuestion.topic}" queued for council evaluation.`,
        '#f59e0b',
        'FileEdit'
      );

      if (user) {
        user.pendingReviewCount = (user.pendingReviewCount || 0) + 1;
      }
    }

    this.saveState();
    return newQuestion;
  }

  updateQuestion(id, updates) {
    const idx = this.questions.findIndex(q => q.id === id);
    if (idx === -1) return null;

    const merged = normalizeQuestion({ ...this.questions[idx], ...updates, updatedAt: new Date().toISOString() });
    merged.qualityScores = calculateQualityScores(merged);
    this.questions[idx] = merged;

    const authorId = this.questions[idx].authorId;
    const user = this.users.find(u => u.id === authorId);
    if (user) {
      const authored = this.questions.filter(q => q.authorId === authorId && q.status === 'Live').length;
      const pending = this.questions.filter(q => q.authorId === authorId && q.status === 'Pending Review').length;
      user.questionsAuthored = authored;
      user.pendingReviewCount = pending;
    }

    this.saveState();
    return this.questions[idx];
  }

  approveQuestion(id) {
    const question = this.getQuestionById(id);
    if (!question) return null;

    question.status = 'Live';
    question.updatedAt = new Date().toISOString();

    this.addDPTransaction(
      question.authorId,
      30,
      `Peer review approval royalties for question ${question.id}`,
      'question',
      question.id
    );

    this.addActivity(
      question.authorId,
      'question_approved',
      'Question Approved',
      `"${question.topic}" was approved by peer council (+30 DP).`,
      '#0df2c9',
      'Check',
      30
    );

    const user = this.users.find(u => u.id === question.authorId);
    if (user) {
      const pending = this.questions.filter(q => q.authorId === question.authorId && q.status === 'Pending Review').length;
      user.pendingReviewCount = pending;
      user.royaltiesEarned = (user.royaltiesEarned || 0) + 30;
      user.questionsAuthored = (user.questionsAuthored || 0) + 1;
    }

    this.saveState();
    return question;
  }

  deleteQuestion(id) {
    const idx = this.questions.findIndex(q => q.id === id);
    if (idx === -1) return false;
    const authorId = this.questions[idx].authorId;
    this.questions.splice(idx, 1);

    const user = this.users.find(u => u.id === authorId);
    if (user) {
      const authored = this.questions.filter(q => q.authorId === authorId && q.status === 'Live').length;
      const pending = this.questions.filter(q => q.authorId === authorId && q.status === 'Pending Review').length;
      user.questionsAuthored = authored;
      user.pendingReviewCount = pending;
    }

    this.saveState();
    return true;
  }

  // --- Battles & Interactive Gameplay ---
  createBattle(opponentId, deckId = 'deck_1', subject = 'Academic Duel', format = 'standard') {
    const challenger = this.getCurrentUser();
    const opponent = this.users.find(u => u.id === opponentId) || this.users[1];

    let deckQuestions = this.questions.filter(q => q.deckId === deckId);
    if (deckQuestions.length < 5) {
      deckQuestions = this.questions;
    }
    const shuffled = [...deckQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 5);
    const selected = selectedQuestions.map(q => q.id);

    const isSuddenDeath = format === 'sudden_death';
    const dpReward = isSuddenDeath ? 180 : 120;
    const dpLoss = isSuddenDeath ? 60 : 40;
    const timerSeconds = isSuddenDeath ? 10 : 15;
    const accuracy = opponent.difficulty === 'hard' ? 82 : opponent.difficulty === 'easy' ? 58 : 72;

    const newBattle = {
      id: `battle_${Date.now()}`,
      challengerId: challenger.id,
      challengerName: challenger.name,
      challengerAvatar: challenger.avatar,
      challengerLevel: challenger.level,
      opponentId: opponent.id,
      opponentName: opponent.name,
      opponentAvatar: opponent.avatar,
      opponentLevel: opponent.level,
      opponentRank: opponent.tier || opponent.rank || 'Master Duelist',
      deckId,
      subject,
      format,
      status: 'your_turn',
      stateLabel: isSuddenDeath ? 'Sudden Death Stakes' : 'Your Turn',
      currentRound: 1,
      maxRounds: 5,
      userScore: 0,
      opponentScore: 0,
      timeRemainingSeconds: timerSeconds,
      dpReward,
      dpLoss,
      accuracy,
      questionIds: selected,
      questions: selectedQuestions,
      roundHistory: [],
      createdAt: new Date().toISOString()
    };

    this.battles.unshift(newBattle);

    this.addActivity(
      challenger.id,
      'battle_challenge_dispatched',
      'Challenge Dispatched',
      `Sent challenge to ${opponent.name} in ${subject}.`,
      '#0df2c9',
      'Swords'
    );

    this.saveState();
    return newBattle;
  }

  startLightningArena() {
    const user = this.getCurrentUser();
    let stemQuestions = this.questions.filter(q => q.category === 'Science' || q.deckId.startsWith('deck_'));
    if (stemQuestions.length < 10) {
      stemQuestions = this.questions;
    }
    const shuffled = [...stemQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10).map(q => q.id);

    const lightningBattle = {
      id: `lightning_${Date.now()}`,
      challengerId: user.id,
      challengerName: user.name,
      challengerAvatar: user.avatar,
      challengerLevel: user.level,
      opponentId: 'ai_arena',
      opponentName: 'Apex Rival AI',
      opponentAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      opponentLevel: 15,
      deckId: 'deck_1',
      subject: 'Daily Lightning Arena (Double DP)',
      status: 'your_turn',
      stateLabel: 'Lightning Speed Active',
      currentRound: 1,
      maxRounds: Math.min(10, selected.length),
      userScore: 0,
      opponentScore: 0,
      timeRemainingSeconds: 12,
      dpReward: 240,
      dpLoss: 0,
      questionIds: selected,
      roundHistory: [],
      createdAt: new Date().toISOString()
    };

    this.battles.unshift(lightningBattle);
    this.saveState();
    return lightningBattle;
  }

  submitBattleAnswer(battleId, roundNumber, selectedOptionId, responseTimeMs = 3000) {
    const battle = this.battles.find(b => b.id === battleId);
    if (!battle) return { error: 'Battle not found' };

    const qId = battle.questionIds[roundNumber - 1];
    const question = this.getQuestionById(qId);
    if (!question) return { error: 'Question not found' };

    let isUserCorrect = false;
    let selectedIdx = 0;
    if (typeof selectedOptionId === 'number') {
      selectedIdx = selectedOptionId;
      isUserCorrect = selectedOptionId === (question.correctAnswerIndex ?? question.correctIndex ?? 0);
    } else if (typeof selectedOptionId === 'string' && selectedOptionId.startsWith('opt_')) {
      selectedIdx = parseInt(selectedOptionId.replace('opt_', ''), 10) - 1;
      isUserCorrect = selectedIdx === (question.correctAnswerIndex ?? question.correctIndex ?? 0);
    } else {
      const selectedOption = (question.options || []).find((o, i) => {
        if (o.id === selectedOptionId) {
          selectedIdx = i;
          return true;
        }
        return false;
      });
      isUserCorrect = !!(selectedOption && selectedOption.isCorrect);
    }

    // AI opponent simulated response
    const opponentCorrect = Math.random() < 0.68;
    const opponentTimeMs = Math.floor(2500 + Math.random() * 4000);

    if (isUserCorrect) battle.userScore += 1;
    if (opponentCorrect) battle.opponentScore += 1;

    const roundRecord = {
      round: roundNumber,
      questionId: qId,
      userOptionId: selectedOptionId,
      userCorrect: isUserCorrect,
      opponentCorrect,
      userTimeMs: responseTimeMs,
      opponentTimeMs,
      explanation: question.explanation,
      correctOptionId: (question.options?.find(o => o.isCorrect) || {}).id || 'opt_1'
    };

    battle.roundHistory.push(roundRecord);

    const isGameOver = roundNumber >= battle.maxRounds;
    let result = null;

    if (isGameOver) {
      battle.status = 'completed';
      const isVictory = battle.userScore > battle.opponentScore;
      const isDraw = battle.userScore === battle.opponentScore;
      result = isVictory ? 'victory' : isDraw ? 'draw' : 'defeat';

      const user = this.getCurrentUser();
      const dpChange = isVictory ? battle.dpReward : isDraw ? Math.floor(battle.dpReward / 3) : -battle.dpLoss;

      if (user) {
        if (isVictory) {
          user.wins = (user.wins || 0) + 1;
          user.streak = (user.streak || 0) + 1;
        } else if (!isDraw) {
          user.losses = (user.losses || 0) + 1;
        }
        user.totalBattles = (user.wins || 0) + (user.losses || 0);

        this.addDPTransaction(
          user.id,
          dpChange,
          `${isVictory ? 'Victory' : isDraw ? 'Draw' : 'Defeat'} in ${battle.subject} (${battle.userScore} - ${battle.opponentScore})`,
          'battle',
          battle.id
        );

        this.addActivity(
          user.id,
          isVictory ? 'battle_victory' : 'battle_defeat',
          isVictory ? `Won match vs ${battle.opponentName}` : isDraw ? `Draw vs ${battle.opponentName}` : `Match Defeat vs ${battle.opponentName}`,
          `${dpChange >= 0 ? '+' : ''}${dpChange} DP in ${battle.subject} (${battle.userScore} - ${battle.opponentScore})`,
          isVictory ? '#0df2c9' : isDraw ? '#f59e0b' : '#ef4444',
          'Swords'
        );

        this.battleLogs.unshift({
          id: `log_${Date.now()}`,
          opponentId: battle.opponentId,
          opponentName: battle.opponentName,
          opponentAvatar: battle.opponentAvatar,
          subject: battle.subject,
          date: 'Just now',
          finalScore: `${battle.userScore} - ${battle.opponentScore}`,
          result: isVictory ? 'W' : isDraw ? 'D' : 'L',
          dpChange,
          roundsWon: battle.userScore,
          accuracy: Math.round((battle.userScore / battle.maxRounds) * 100)
        });
      }
    } else {
      battle.currentRound = roundNumber + 1;
      battle.stateLabel = `Round ${battle.currentRound} Active`;
    }

    this.saveState();

    return {
      battle,
      roundRecord,
      isUserCorrect,
      opponentCorrect,
      correctOptionId: roundRecord.correctOptionId,
      explanation: question.explanation,
      isGameOver,
      result,
      userScore: battle.userScore,
      opponentScore: battle.opponentScore
    };
  }

  acceptInvite(inviteId) {
    const inviteIdx = this.incomingInvites.findIndex(i => i.id === inviteId);
    if (inviteIdx !== -1) {
      const invite = this.incomingInvites[inviteIdx];
      this.incomingInvites.splice(inviteIdx, 1);
      const battle = this.createBattle(invite.challengerId, invite.deckId, invite.subject);
      return battle;
    }
    return null;
  }

  declineInvite(inviteId) {
    const inviteIdx = this.incomingInvites.findIndex(i => i.id === inviteId);
    if (inviteIdx !== -1) {
      this.incomingInvites.splice(inviteIdx, 1);
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Friends Network ---
  sendFriendRequest(username) {
    const clean = username.toLowerCase().replace('@', '').trim();
    const user = this.users.find(u => u.username.toLowerCase() === clean);
    if (!user) return { error: `Scholar @${username} not found` };
    if (user.id === this.currentUserId) return { error: 'You cannot add yourself' };
    if (this.friends.some(f => f.id === user.id)) return { error: `Already in study circle with ${user.name}` };

    const req = {
      id: `freq_${Date.now()}`,
      senderId: this.currentUserId,
      senderName: this.getCurrentUser().name,
      senderAvatar: this.getCurrentUser().avatar,
      senderLevel: this.getCurrentUser().level,
      senderBio: this.getCurrentUser().bio || 'Aspiring Scholar',
      targetId: user.id,
      timeAgo: 'Just now'
    };

    this.friendRequests.push(req);
    this.saveState();
    return { success: true, request: req };
  }

  acceptFriendRequest(requestId) {
    const idx = this.friendRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return { error: 'Request not found' };

    const req = this.friendRequests[idx];
    this.friendRequests.splice(idx, 1);

    const sender = this.users.find(u => u.id === req.senderId) || {
      id: req.senderId || `user_${Date.now()}`,
      name: req.senderName || 'Scholar Peer',
      username: (req.senderName || 'peer').toLowerCase().replace(/\s+/g, '_'),
      avatar: req.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 10,
      dp: 2400
    };

    const newFriend = {
      id: sender.id,
      name: sender.name,
      username: sender.username,
      handle: sender.handle || `@${sender.username}`,
      avatar: sender.avatar,
      level: sender.level || 10,
      onlineStatus: 'online',
      subject: sender.selectedSubjects?.[0] || 'Academic General',
      relationshipTag: 'Guild Mate',
      rank: sender.tier || sender.rank || 'Scholar',
      dp: sender.dp || 2500,
      streak: sender.streak || 3,
      winRate: '75%'
    };

    if (!this.friends.some(f => f.id === newFriend.id)) {
      this.friends.push(newFriend);
    }

    this.addActivity(
      this.currentUserId,
      'friend_connected',
      'Study Circle Expanded',
      `Connected with ${newFriend.name}.`,
      '#8b5cf6',
      'Users'
    );

    this.saveState();
    return { success: true, friend: newFriend };
  }

  declineFriendRequest(requestId) {
    const idx = this.friendRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      this.friendRequests.splice(idx, 1);
      this.saveState();
      return true;
    }
    return false;
  }

  removeFriend(friendId) {
    const idx = this.friends.findIndex(f => f.id === friendId);
    if (idx !== -1) {
      this.friends.splice(idx, 1);
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Notifications ---
  addNotification(userId, { type, category, title, message, metadata }) {
    const notif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      type: type || 'general',
      category: category || 'system',
      title,
      message,
      metadata: metadata || {},
      read: false,
      time: 'Just now',
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.saveState();
    return notif;
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach(n => { n.read = true; });
    this.saveState();
  }

  markNotificationAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveState();
    }
  }

  // --- Activities Ledger ---
  addActivity(userId, type, title, text, color = '#0df2c9', icon = 'Sparkles', dp = 0) {
    const act = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      type,
      title,
      text,
      color,
      icon,
      dp,
      time: 'Just now',
      createdAt: new Date().toISOString()
    };
    this.activities.unshift(act);
    this.saveState();
    return act;
  }

  getUserActivities(userId = null) {
    const targetUserId = userId || this.currentUserId;
    return this.activities.filter(a => a.userId === targetUserId || (!a.userId && targetUserId === 'user_1'));
  }
}

const dataStore = new DataStore();
export default dataStore;
