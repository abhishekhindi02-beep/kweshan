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

const STORAGE_KEY = 'kweshun_app_state_v3';

export function normalizeQuestion(q) {
  if (!q) return null;
  const promptText = q.prompt || q.text || q.question || '';
  let correctIdx = typeof q.correctAnswerIndex === 'number' 
    ? q.correctAnswerIndex 
    : (typeof q.correctIndex === 'number' ? q.correctIndex : 0);
  
  // Format options consistently
  const formattedOptions = (q.options || []).map((opt, i) => {
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
  });

  // Calculate analytics defaults
  const plays = typeof q.plays === 'number' ? q.plays : (typeof q.totalAttempts === 'number' ? q.totalAttempts : 0);
  const correctAttempts = typeof q.correctAttempts === 'number' ? q.correctAttempts : Math.round(plays * 0.7);
  const incorrectAttempts = typeof q.incorrectAttempts === 'number' ? q.incorrectAttempts : Math.max(0, plays - correctAttempts);
  const accuracy = plays > 0 ? Math.round((correctAttempts / plays) * 100) : (q.accuracy || 0);

  let answerDist = q.answerDistribution;
  if (!answerDist) {
    if (plays > 0) {
      const correctLetter = ['A', 'B', 'C', 'D'][correctIdx] || 'A';
      const rem = plays - correctAttempts;
      const d1 = Math.floor(rem / 3);
      const d2 = Math.floor(rem / 3);
      const d3 = rem - d1 - d2;
      answerDist = { A: 0, B: 0, C: 0, D: 0 };
      answerDist[correctLetter] = correctAttempts;
      const otherLetters = ['A', 'B', 'C', 'D'].filter(l => l !== correctLetter);
      answerDist[otherLetters[0]] = d1;
      answerDist[otherLetters[1]] = d2;
      answerDist[otherLetters[2]] = d3;
    } else {
      answerDist = { A: 0, B: 0, C: 0, D: 0 };
    }
  }

  const totalD = (answerDist.A || 0) + (answerDist.B || 0) + (answerDist.C || 0) + (answerDist.D || 0);
  const optionDistribution = totalD > 0 ? [
    Math.round(((answerDist.A || 0) / totalD) * 100),
    Math.round(((answerDist.B || 0) / totalD) * 100),
    Math.round(((answerDist.C || 0) / totalD) * 100),
    Math.round(((answerDist.D || 0) / totalD) * 100)
  ] : [0, 0, 0, 0];

  const qualityScores = q.qualityScores || calculateQualityScores(q);

  let canonicalStatus = 'Live';
  const rawStatus = (q.status || 'Live').toLowerCase();
  if (rawStatus === 'draft') canonicalStatus = 'Draft';
  else if (rawStatus === 'pending' || rawStatus === 'pending review') canonicalStatus = 'Pending Review';
  else canonicalStatus = 'Live';

  return {
    ...q,
    text: promptText,
    prompt: promptText,
    options: formattedOptions,
    correctAnswerIndex: correctIdx,
    correctIndex: correctIdx,
    explanation: q.explanation || 'Canonical academic derivation and proof.',
    citation: q.citation || q.citations || 'Academic Standard Curriculum',
    citations: q.citations || q.citation || 'Academic Standard Curriculum',
    difficulty: q.difficulty || 'Medium',
    status: canonicalStatus,
    plays,
    totalAttempts: plays,
    correctAttempts,
    incorrectAttempts,
    accuracy,
    answerDistribution: answerDist,
    optionDistribution,
    avgTimeSeconds: q.avgTimeSeconds || 7.2,
    dpEarned: q.dpEarned || (canonicalStatus === 'Live' ? 30 : 0),
    qualityScores
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
        if (saved) {
          const parsed = JSON.parse(saved);
          this.users = parsed.users || initialUsers;
          this.currentUserId = parsed.currentUserId || 'user_1';
          this.decks = parsed.decks || initialDecks;
          
          // Ensure questions are merged with initial questions
          const loadedQuestions = (parsed.questions || []).map(normalizeQuestion);
          const initialNormalized = initialQuestions.map(normalizeQuestion);
          
          // Combine loaded questions and any missing initial questions
          const loadedIds = new Set(loadedQuestions.map(q => q.id));
          const missing = initialNormalized.filter(q => !loadedIds.has(q.id));
          this.questions = [...loadedQuestions, ...missing];

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
      console.error('Failed to load state from localStorage', e);
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
      }
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
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
      this.saveState();
    }
  }

  registerUser({ name, username, email, password }) {
    const cleanUsername = username.toLowerCase().replace(/\s+/g, '_');
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === cleanUsername);
    if (existing) {
      return { error: 'User with this email or username already exists' };
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      username: cleanUsername,
      email,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      level: 1,
      tier: 'INITIATE DUELIST',
      dp: 1000,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      wins: 0,
      losses: 0,
      totalBattles: 0,
      score: 100,
      weeklyChange: 0,
      questionsAuthored: 0,
      pendingReviewCount: 0,
      monthlyRank: this.users.length + 1,
      totalPlayers: this.users.length + 1,
      onlineStatus: 'online',
      bio: 'New recruit entering the academic arenas.',
      royaltiesEarned: 0,
      globalAccuracy: 0,
      mostPlayedDeck: 'Science',
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUserId = newUser.id;
    this.saveState();
    return { user: newUser };
  }

  loginUser(identifier, password) {
    const clean = identifier.toLowerCase().trim();
    const user = this.users.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) || this.users[0];
    this.currentUserId = user.id;
    this.saveState();
    return { user };
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

  // --- DP System & Ledger ---
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
      wins: user.wins,
      losses: user.losses,
      totalBattles: user.totalBattles,
      winRate: user.totalBattles > 0 ? Math.round((user.wins / user.totalBattles) * 100) : 0,
      score: timeframe === 'monthly' ? (user.score || 400) : user.dp,
      dp: user.dp,
      subject: user.subject || 'STEM General',
      isCurrentUser: user.id === this.currentUserId
    }));
  }

  // --- Decks & Progress System ---
  updateDeckMastery(deckId, increasePercentage = 10) {
    const deck = this.decks.find(d => d.id === deckId);
    if (!deck) return null;

    const currentMastery = deck.mastery || deck.progress || 0;
    const newMastery = Math.min(100, Math.max(0, currentMastery + increasePercentage));
    deck.mastery = newMastery;
    deck.progress = newMastery;
    this.saveState();
    return deck;
  }

  // --- Questions CRUD & Quality System ---
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

    const newQuestion = normalizeQuestion({
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      authorId,
      authorName: questionData.authorName || user?.name || 'Kianna Torff',
      deckId: questionData.deckId || 'deck_1',
      deckName: questionData.deckName || 'General Academic Deck',
      category: questionData.category || 'Science',
      topic: questionData.topic || questionData.prompt?.slice(0, 40) || 'Academic Concept',
      text: questionData.prompt || questionData.text,
      prompt: questionData.prompt || questionData.text,
      options: questionData.options,
      correctAnswerIndex: questionData.correctAnswerIndex ?? questionData.correctIndex ?? 0,
      correctIndex: questionData.correctIndex ?? questionData.correctAnswerIndex ?? 0,
      explanation: questionData.explanation || '',
      citations: questionData.citations || questionData.citation || '',
      citation: questionData.citation || questionData.citations || '',
      difficulty: questionData.difficulty || 'Medium',
      tags: questionData.tags || ['Academic', 'Competitive'],
      status: canonicalStatus,
      qualityScores,
      plays: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      accuracy: 0,
      answerDistribution: { A: 0, B: 0, C: 0, D: 0 },
      optionDistribution: [0, 0, 0, 0],
      dpEarned: canonicalStatus === 'Live' ? 30 : 0,
      createdAt: new Date().toISOString()
    });

    this.questions.unshift(newQuestion);

    // If published as Live, award +30 DP immediately
    if (canonicalStatus === 'Live') {
      this.addDPTransaction(
        authorId,
        30,
        `Direct Publish Royalty for question "${newQuestion.topic}"`,
        'question',
        newQuestion.id
      );

      this.addActivity(
        authorId,
        'question_published',
        'Question Published Directly',
        `"${newQuestion.topic}" published live to academic decks (+30 DP).`,
        '#00f59b',
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
        'Question Submitted for Review',
        `"${newQuestion.topic}" queued for peer verification.`,
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
    if (updates.text || updates.prompt || updates.options || updates.explanation || updates.citations) {
      merged.qualityScores = calculateQualityScores(merged);
    }
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
      `"${question.topic}" was vetted by peer council (+30 DP).`,
      '#00f59b',
      'Check',
      30
    );

    this.addNotification(question.authorId, {
      type: 'question_approved',
      category: 'questions',
      title: 'Question Approved: +30 DP Royalties',
      message: `"${question.topic}" was approved and published with Quality Score ${question.qualityScores.composite} (${question.qualityScores.grade}).`,
      metadata: { questionId: question.id }
    });

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

  // --- Dynamic Question Attempt Recording ---
  recordQuestionAttempt(questionId, selectedOptionIdx, isCorrect, responseTimeMs = 3000) {
    const q = this.questions.find(item => item.id === questionId);
    if (!q) return;

    q.plays = (q.plays || 0) + 1;
    q.totalAttempts = q.plays;

    if (!q.answerDistribution) {
      q.answerDistribution = { A: 0, B: 0, C: 0, D: 0 };
    }
    const letter = ['A', 'B', 'C', 'D'][selectedOptionIdx] || 'A';
    q.answerDistribution[letter] = (q.answerDistribution[letter] || 0) + 1;

    if (isCorrect) {
      q.correctAttempts = (q.correctAttempts || 0) + 1;
    } else {
      q.incorrectAttempts = (q.incorrectAttempts || 0) + 1;
    }

    q.accuracy = Math.round((q.correctAttempts / q.plays) * 100);

    const totalDist = (q.answerDistribution.A || 0) + (q.answerDistribution.B || 0) + (q.answerDistribution.C || 0) + (q.answerDistribution.D || 0);
    q.optionDistribution = totalDist > 0 ? [
      Math.round(((q.answerDistribution.A || 0) / totalDist) * 100),
      Math.round(((q.answerDistribution.B || 0) / totalDist) * 100),
      Math.round(((q.answerDistribution.C || 0) / totalDist) * 100),
      Math.round(((q.answerDistribution.D || 0) / totalDist) * 100)
    ] : [0, 0, 0, 0];

    this.saveState();
  }

  // --- Battles & Interactive Gameplay ---
  createBattle(opponentId, deckId = 'deck_1', subject = 'Academic Duel') {
    const challenger = this.getCurrentUser();
    const opponent = this.users.find(u => u.id === opponentId) || this.users[1];

    let deckQuestions = this.questions.filter(q => q.deckId === deckId);
    if (deckQuestions.length < 5) {
      deckQuestions = this.questions;
    }
    const shuffled = [...deckQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5).map(q => q.id);

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
      opponentRank: opponent.tier || 'Master Duelist',
      deckId,
      subject,
      status: 'your_turn',
      stateLabel: 'Your Turn',
      currentRound: 1,
      maxRounds: 5,
      userScore: 0,
      opponentScore: 0,
      timeRemainingSeconds: 15,
      dpReward: 120,
      dpLoss: 40,
      questionIds: selected,
      roundHistory: [],
      createdAt: new Date().toISOString()
    };

    this.battles.unshift(newBattle);

    this.addNotification(opponent.id, {
      actorId: challenger.id,
      actorName: challenger.name,
      actorAvatar: challenger.avatar,
      type: 'battle_challenge',
      category: 'battles',
      title: `Duel Challenge from ${challenger.name}`,
      message: `Challenged you to a 5-round battle in ${subject}!`,
      metadata: { battleId: newBattle.id, deckId }
    });

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

    // AI opponent performance simulation based on realistic accuracy (~65-75%)
    const opponentCorrect = Math.random() < 0.70;
    const opponentTimeMs = Math.floor(2500 + Math.random() * 4000);

    // Record question attempt in analytics
    this.recordQuestionAttempt(qId, selectedIdx, isUserCorrect, responseTimeMs);

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
      correctOptionId: (question.options.find(o => o.isCorrect) || {}).id || 'opt_1'
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
          isVictory ? '#00f59b' : isDraw ? '#f59e0b' : '#ef4444',
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

        this.addNotification(user.id, {
          type: 'battle_result',
          category: 'battles',
          title: isVictory ? `Match Victory vs ${battle.opponentName}` : isDraw ? `Match Draw vs ${battle.opponentName}` : `Match Defeat vs ${battle.opponentName}`,
          message: `Final Score: ${battle.userScore} - ${battle.opponentScore}. DP Change: ${dpChange >= 0 ? '+' : ''}${dpChange} DP.`,
          metadata: { battleId: battle.id }
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

  // --- Friends Network & Requests ---
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
    this.addNotification(user.id, {
      type: 'friend_request',
      category: 'friends',
      title: 'Study Circle Invitation',
      message: `${this.getCurrentUser().name} (@${this.getCurrentUser().username}) sent you a study circle connection request.`,
      metadata: { requestId: req.id }
    });

    this.saveState();
    return { success: true, request: req };
  }

  acceptFriendRequest(requestId) {
    const idx = this.friendRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return { error: 'Request not found' };

    const req = this.friendRequests[idx];
    this.friendRequests.splice(idx, 1);

    const sender = this.users.find(u => u.id === req.senderId) || {
      id: req.senderId,
      name: req.senderName,
      username: req.senderName.toLowerCase().replace(/\s+/g, '_'),
      avatar: req.senderAvatar,
      level: req.senderLevel || 10,
      subject: 'STEM General',
      dp: 2000
    };

    const newFriend = {
      id: sender.id,
      name: sender.name,
      username: sender.username,
      avatar: sender.avatar,
      level: sender.level,
      onlineStatus: 'online',
      subject: sender.subject || 'STEM General',
      relationshipTag: 'Guild Mate',
      dp: sender.dp || 2000
    };

    if (!this.friends.some(f => f.id === newFriend.id)) {
      this.friends.push(newFriend);
    }

    this.addActivity(
      this.currentUserId,
      'friend_connected',
      'Study Circle Expanded',
      `Connected with ${newFriend.name} (@${newFriend.username}).`,
      '#8b5cf6',
      'Users'
    );

    this.saveState();
    return { success: true, friend: newFriend };
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

  // --- Notifications & Feed ---
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
  addActivity(userId, type, title, text, color = '#00f59b', icon = 'Sparkles', dp = 0) {
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
}

const dataStore = new DataStore();
export default dataStore;
