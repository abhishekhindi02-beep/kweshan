import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dataStore from '../services/dataStore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const { currentUser, user } = useAuth();
  const effectiveUser = currentUser || user || dataStore.getCurrentUser();
  const { addToast } = useToast();

  // Reactive state synced with dataStore
  const [decks, setDecks] = useState(() => dataStore.getDecksForUser(effectiveUser?.id));
  const [questions, setQuestions] = useState(() => dataStore.questions);
  const [battles, setBattles] = useState(() => dataStore.battles);
  const [incomingInvites, setIncomingInvites] = useState(() => dataStore.incomingInvites);
  const [battleLogs, setBattleLogs] = useState(() => dataStore.battleLogs);
  const [friends, setFriends] = useState(() => dataStore.friends);
  const [friendRequests, setFriendRequests] = useState(() => dataStore.friendRequests);
  const [notifications, setNotifications] = useState(() => dataStore.notifications);
  const [activities, setActivities] = useState(() => dataStore.getUserActivities(effectiveUser?.id));
  const [dpTransactions, setDpTransactions] = useState(() => dataStore.dpTransactions);

  // Active Modals & Workflows
  const [activeBattleId, setActiveBattleId] = useState(null);
  const [activeBattleData, setActiveBattleData] = useState(null);
  const [isLightningActive, setIsLightningActive] = useState(false);
  const [challengeTargetUser, setChallengeTargetUser] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isWritingQuestion, setIsWritingQuestion] = useState(false);
  const [analyticsQuestionId, setAnalyticsQuestionId] = useState(null);
  const [isInviteFriendOpen, setIsInviteFriendOpen] = useState(false);
  const [lastBattleResult, setLastBattleResult] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [practicingDeck, setPracticingDeck] = useState(null);

  const syncState = useCallback(() => {
    const currentActiveUser = currentUser || user || dataStore.getCurrentUser();
    setDecks(dataStore.getDecksForUser(currentActiveUser?.id));
    setQuestions([...dataStore.questions]);
    setBattles([...dataStore.battles]);
    setIncomingInvites([...dataStore.incomingInvites]);
    setBattleLogs([...dataStore.battleLogs]);
    setFriends([...dataStore.friends]);
    setFriendRequests([...dataStore.friendRequests]);
    setNotifications([...dataStore.notifications]);
    setActivities(dataStore.getUserActivities(currentActiveUser?.id));
    setDpTransactions([...dataStore.dpTransactions]);
  }, [currentUser, user]);

  useEffect(() => {
    syncState();
    const unsubscribe = dataStore.subscribe(() => {
      syncState();
    });
    return unsubscribe;
  }, [syncState]);

  // Computed Values strictly for the active user
  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && (n.userId === effectiveUser?.id || !n.userId)
  ).length;
  
  const waitingBattlesCount = battles.filter(
    (b) => b.status === 'your_turn' && (b.challengerId === effectiveUser?.id || b.opponentId === effectiveUser?.id)
  ).length;

  const userQuestions = questions.filter((q) => q.authorId === effectiveUser?.id);
  const pendingQuestionsCount = userQuestions.filter(
    (q) => q.status === 'Pending Review' || q.status === 'pending'
  ).length;

  const leaderboard = dataStore.getLeaderboard('monthly');

  // --- Battle Actions ---
  const startBattleWith = (opponentId, deckId = 'deck_1', subject = 'Academic Duel', format = 'standard') => {
    const battle = dataStore.createBattle(opponentId, deckId, subject, format);
    setActiveBattleId(battle.id);
    setActiveBattleData(battle);
    if (addToast) {
      addToast({ title: 'Battle Started', message: `Round 1 ready against ${battle.opponentName}`, type: 'success' });
    }
    return battle;
  };

  const playDailyLightning = () => {
    const battle = dataStore.startLightningArena();
    setActiveBattleId(battle.id);
    setIsLightningActive(true);
    if (addToast) {
      addToast({ title: 'Lightning Arena', message: '10 rapid-fire prompts! Double DP Event.', type: 'info' });
    }
    return battle;
  };

  const playRound = (battleId) => {
    setActiveBattleId(battleId);
  };

  const submitAnswer = (battleId, roundNumber, selectedOptionId, responseTimeMs) => {
    const outcome = dataStore.submitBattleAnswer(battleId, roundNumber, selectedOptionId, responseTimeMs);
    if (outcome.isGameOver) {
      setLastBattleResult(outcome);
      setActiveBattleId(null);
      setIsLightningActive(false);
    }
    return outcome;
  };

  const acceptInvite = (inviteId) => {
    const battle = dataStore.acceptInvite(inviteId);
    if (battle) {
      setActiveBattleId(battle.id);
      if (addToast) {
        addToast({ title: 'Invite Accepted', message: `Entering battle against ${battle.opponentName}`, type: 'success' });
      }
    }
    return battle;
  };

  const declineInvite = (inviteId) => {
    dataStore.declineInvite(inviteId);
    if (addToast) {
      addToast({ title: 'Invite Declined', message: 'Challenge removed from your feed', type: 'info' });
    }
  };

  // --- Practice Deck Mode ---
  const startPracticeDeck = (deckId) => {
    const deck = decks.find((d) => d.id === deckId) || decks[0];
    setPracticingDeck(deck);
  };

  const completePracticeDeck = (deckId, correctCount, totalCount) => {
    const masteryDelta = Math.round((correctCount / (totalCount || 1)) * 10);
    const dpGained = correctCount * 10;
    
    // Update deck progress for this user in dataStore
    dataStore.updateDeckMastery(deckId, masteryDelta, effectiveUser?.id);

    if (dpGained > 0 && effectiveUser) {
      const deck = decks.find((d) => d.id === deckId);
      dataStore.addDPTransaction(
        effectiveUser.id,
        dpGained,
        `Practice Session: ${deck?.title || 'Academic Deck'} (${correctCount}/${totalCount} correct)`,
        'practice',
        deckId
      );
      dataStore.addActivity(
        effectiveUser.id,
        'practice_completed',
        'Practice Completed',
        `Completed practice in ${deck?.title || 'Deck'} (+${dpGained} DP).`,
        '#0df2c9',
        'BookOpen'
      );
    }

    setPracticingDeck(null);
    if (addToast) {
      addToast({
        title: 'Practice Session Completed!',
        message: `Scored ${correctCount}/${totalCount} • Earned +${dpGained} DP!`,
        type: 'success'
      });
    }
  };

  // --- Question Actions ---
  const saveQuestion = (questionData) => {
    if (editingQuestion) {
      const updated = dataStore.updateQuestion(editingQuestion.id, questionData);
      setEditingQuestion(null);
      if (addToast) {
        addToast({ title: 'Question Updated', message: `Saved changes to "${updated?.topic || updated?.prompt}"`, type: 'success' });
      }
      return updated;
    } else {
      const created = dataStore.createQuestion({ ...questionData, authorId: effectiveUser?.id, authorName: effectiveUser?.name });
      setIsWritingQuestion(false);
      if (addToast) {
        addToast({ title: 'Question Saved', message: `Saved "${created.topic || created.prompt}" as ${created.status}`, type: 'success' });
      }
      return created;
    }
  };

  const createQuestion = (questionData) => {
    return dataStore.createQuestion({ ...questionData, authorId: effectiveUser?.id, authorName: effectiveUser?.name });
  };

  const updateQuestion = (id, updates) => {
    return dataStore.updateQuestion(id, updates);
  };

  const submitForReview = (questionId) => {
    const updated = dataStore.updateQuestion(questionId, { status: 'Pending Review' });
    if (updated && effectiveUser) {
      dataStore.addActivity(
        effectiveUser.id,
        'question_submitted',
        'Question Submitted for Review',
        `"${updated.topic || updated.prompt}" queued for peer verification.`,
        '#f59e0b',
        'FileEdit'
      );
      if (addToast) {
        addToast({ title: 'Submitted for Review', message: 'Peer council will review question quality shortly.', type: 'info' });
      }
    }
    return updated;
  };

  const approveQuestion = (questionId) => {
    const approved = dataStore.approveQuestion(questionId);
    if (approved && addToast) {
      addToast({ title: 'Question Approved (+30 DP)', message: `"${approved.topic || approved.prompt}" is now Live!`, type: 'success' });
    }
    return approved;
  };

  const rejectQuestion = (questionId) => {
    const updated = dataStore.updateQuestion(questionId, { status: 'Draft' });
    if (addToast) {
      addToast({ title: 'Question Returned', message: 'Question returned to draft status with revision notes.', type: 'info' });
    }
    return updated;
  };

  const deleteQuestion = (questionId) => {
    dataStore.deleteQuestion(questionId);
    if (addToast) {
      addToast({ title: 'Question Deleted', message: 'Question removed from your repository.', type: 'info' });
    }
  };

  const recordQuestionAttempt = (questionId, selectedOptionIdx, isCorrect, responseTimeMs) => {
    // Record if question exists
  };

  // --- Friend Actions ---
  const sendFriendRequest = (username) => {
    const res = dataStore.sendFriendRequest(username);
    if (res.error) {
      if (addToast) addToast({ title: 'Request Failed', message: res.error, type: 'error' });
      return false;
    }
    if (addToast) addToast({ title: 'Friend Request Sent', message: `Connection invite dispatched to @${username}`, type: 'success' });
    return true;
  };

  const acceptFriendRequest = (requestId) => {
    const res = dataStore.acceptFriendRequest(requestId);
    if (res.success && addToast) {
      addToast({ title: 'Friend Added', message: `Added ${res.friend.name} to study circle!`, type: 'success' });
    }
    return res;
  };

  const ignoreFriendRequest = (requestId) => {
    dataStore.declineFriendRequest(requestId);
    if (addToast) addToast({ title: 'Request Dismissed', message: 'Friend invitation removed.', type: 'info' });
  };

  const removeFriend = (friendId) => {
    dataStore.removeFriend(friendId);
    if (addToast) addToast({ title: 'Friend Removed', message: 'Removed connection from study circle.', type: 'info' });
  };

  // --- Notification Actions ---
  const markNotificationRead = (notifId) => {
    dataStore.markNotificationAsRead(notifId);
  };

  const markAllNotificationsRead = () => {
    dataStore.markAllNotificationsAsRead();
    if (addToast) addToast({ title: 'Notifications Cleared', message: 'Marked all notifications as read.', type: 'info' });
  };

  const handleNotificationAction = (notif) => {
    if (!notif) return;
    markNotificationRead(notif.id);

    const titleLower = (notif.title || '').toLowerCase();
    const msgLower = (notif.message || '').toLowerCase();
    const type = notif.type || '';

    const isBattleAlert = 
      type === 'battle' || 
      type === 'battle_challenge' || 
      type === 'battle_invite' || 
      type === 'challenge_dispatched' ||
      titleLower.includes('challenge') || 
      titleLower.includes('duel') || 
      titleLower.includes('battle') ||
      msgLower.includes('challenged');

    if (isBattleAlert) {
      if (notif.metadata?.battleId) {
        const existing = dataStore.battles.find((b) => b.id === notif.metadata.battleId);
        if (existing) {
          setActiveBattleId(existing.id);
          setActiveBattleData(existing);
          return;
        }
      }
      const deckId = notif.metadata?.deckId || 'deck_1';
      const opponentId = notif.metadata?.challengerId || notif.metadata?.opponentId || 'user_2';
      startBattleWith(opponentId, deckId);
    }
  };

  const globalSearch = (queryStr) => {
    const q = (queryStr || '').toLowerCase().trim();
    if (!q) return { players: [], questions: [], decks: [] };

    const matchedPlayers = dataStore.users.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.username.toLowerCase().includes(q) ||
      (u.handle && u.handle.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedQuestions = dataStore.questions.filter(qu =>
      (qu.prompt || qu.text || '').toLowerCase().includes(q) ||
      (qu.topic || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedDecks = decks.filter(d =>
      d.title.toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    ).slice(0, 3);

    return { players: matchedPlayers, questions: matchedQuestions, decks: matchedDecks };
  };

  return (
    <GameContext.Provider
      value={{
        // State
        decks,
        questions,
        battles,
        battleInvites: incomingInvites,
        incomingInvites,
        battleLogs,
        friends,
        friendRequests,
        notifications,
        activities,
        dpTransactions,
        leaderboard,
        userQuestions,
        unreadNotificationsCount,
        waitingBattlesCount,
        pendingQuestionsCount,
        // Active Modals & Flow
        activeBattleId,
        setActiveBattleId,
        activeBattleData,
        setActiveBattleData,
        isLightningActive,
        setIsLightningActive,
        challengeTargetUser,
        setChallengeTargetUser,
        editingQuestion,
        setEditingQuestion,
        isWritingQuestion,
        setIsWritingQuestion,
        analyticsQuestionId,
        setAnalyticsQuestionId,
        isInviteFriendOpen,
        setIsInviteFriendOpen,
        lastBattleResult,
        setLastBattleResult,
        viewingProfileId,
        setViewingProfileId,
        practicingDeck,
        setPracticingDeck,
        // Actions & Aliases
        startBattleWith,
        playDailyLightning,
        playRound,
        submitAnswer,
        acceptInvite,
        acceptBattleInvite: acceptInvite,
        declineInvite,
        declineBattleInvite: declineInvite,
        startPracticeDeck,
        completePracticeDeck,
        saveQuestion,
        createQuestion,
        updateQuestion,
        submitForReview,
        demoApproveQuestion: approveQuestion,
        approveQuestion,
        rejectQuestion,
        deleteQuestion,
        recordQuestionAttempt,
        sendFriendRequest,
        acceptFriendRequest,
        ignoreFriendRequest,
        declineFriendRequest: ignoreFriendRequest,
        removeFriend,
        markNotificationRead,
        markNotificationAsRead: markNotificationRead,
        markAllNotificationsRead,
        markAllNotificationsAsRead: markAllNotificationsRead,
        handleNotificationAction,
        getLeaderboard: (timeframe) => dataStore.getLeaderboard(timeframe),
        globalSearch
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
