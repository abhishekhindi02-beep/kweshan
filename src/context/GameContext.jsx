import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dataStore from '../services/dataStore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const { currentUser, user } = useAuth();
  const effectiveUser = currentUser || user || dataStore.getCurrentUser();
  const { addToast } = useToast();

  const notifyToast = (msg, type = 'info', title = '') => {
    if (addToast) addToast({ title: title || msg, message: msg, type });
  };

  // Reactive state synced with dataStore for active user
  const [subjects, setSubjects] = useState(() => dataStore.getSubjectsForUser(effectiveUser?.id));
  const [questions, setQuestions] = useState(() => dataStore.getQuestionsForUser(effectiveUser?.id));
  const [stats, setStats] = useState(() => dataStore.getRepositoryStats(effectiveUser?.id));

  // Modals & Active UI state
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isWritingQuestion, setIsWritingQuestion] = useState(false);
  const [activeSubjectModal, setActiveSubjectModal] = useState(null); // { mode: 'create' | 'edit', subject: null }
  const [confirmDialogData, setConfirmDialogData] = useState(null); // { title, message, onConfirm, confirmLabel, isDanger }

  const syncState = useCallback(() => {
    const currentActiveUser = currentUser || user || dataStore.getCurrentUser();
    const currentUserId = currentActiveUser?.id || 'user_1';
    setSubjects(dataStore.getSubjectsForUser(currentUserId));
    setQuestions(dataStore.getQuestionsForUser(currentUserId));
    setStats(dataStore.getRepositoryStats(currentUserId));
  }, [currentUser, user]);

  useEffect(() => {
    syncState();
    const unsubscribe = dataStore.subscribe(() => {
      syncState();
    });
    return unsubscribe;
  }, [syncState]);

  // --- SUBJECT OPERATIONS ---
  const getSubject = useCallback((subjectId) => {
    return dataStore.getSubjectById(subjectId, effectiveUser?.id);
  }, [effectiveUser]);

  const createSubject = useCallback(async ({ name, description }) => {
    const res = await dataStore.createSubject({
      userId: effectiveUser?.id,
      name,
      description
    });
    if (res.error) {
      notifyToast(res.error, 'error', 'Subject Creation');
      return res;
    }
    notifyToast(`Subject "${res.subject.name}" created successfully.`, 'success', 'Subject Created');
    syncState();
    return res;
  }, [effectiveUser, syncState]);

  const updateSubject = useCallback(async (subjectId, { name, description }) => {
    const res = await dataStore.updateSubject(subjectId, { name, description }, effectiveUser?.id);
    if (res.error) {
      notifyToast(res.error, 'error', 'Subject Update');
      return res;
    }
    notifyToast(`Subject "${res.subject.name}" updated.`, 'success', 'Subject Updated');
    syncState();
    return res;
  }, [effectiveUser, syncState]);

  const deleteSubject = useCallback(async (subjectId) => {
    const subject = dataStore.getSubjectById(subjectId, effectiveUser?.id);
    const res = await dataStore.deleteSubject(subjectId, effectiveUser?.id);
    if (res.error) {
      notifyToast(res.error, 'error', 'Delete Subject');
      return res;
    }
    notifyToast(`Subject "${subject?.name || ''}" and its questions were removed.`, 'info', 'Subject Deleted');
    syncState();
    return res;
  }, [effectiveUser, syncState]);

  // --- QUESTION OPERATIONS ---
  const getQuestion = useCallback((questionId) => {
    return dataStore.getQuestionById(questionId, effectiveUser?.id);
  }, [effectiveUser]);

  const getQuestions = useCallback((options = {}) => {
    return dataStore.getQuestionsForUser(effectiveUser?.id, options);
  }, [effectiveUser]);

  const createQuestion = useCallback(async (questionData) => {
    const res = await dataStore.createQuestion({
      userId: effectiveUser?.id,
      ...questionData
    });
    if (res.error) {
      notifyToast(res.error, 'error', 'Add Question');
      return res;
    }
    notifyToast('Question added to your repository.', 'success', 'Question Saved');
    syncState();
    return res;
  }, [effectiveUser, syncState]);

  const updateQuestion = useCallback(async (questionId, updates) => {
    const res = await dataStore.updateQuestion(questionId, updates, effectiveUser?.id);
    if (res.error) {
      notifyToast(res.error, 'error', 'Update Question');
      return res;
    }
    notifyToast('Question updated successfully.', 'success', 'Question Saved');
    syncState();
    return res;
  }, [effectiveUser, syncState]);

  const deleteQuestion = useCallback(async (questionId) => {
    const res = await dataStore.deleteQuestion(questionId, effectiveUser?.id);
    if (res.error) {
      notifyToast(res.error, 'error', 'Delete Question');
      return res;
    }
    notifyToast('Question deleted from repository.', 'info', 'Question Removed');
    syncState();
    return res;
  }, [effectiveUser, syncState]);

  // --- GLOBAL SEARCH ---
  const globalSearch = useCallback((query) => {
    return dataStore.globalSearch(query, effectiveUser?.id);
  }, [effectiveUser]);

  return (
    <GameContext.Provider
      value={{
        // Data
        subjects,
        questions,
        stats,
        // UI & Modals State
        editingQuestion,
        setEditingQuestion,
        isWritingQuestion,
        setIsWritingQuestion,
        activeSubjectModal,
        setActiveSubjectModal,
        confirmDialogData,
        setConfirmDialogData,
        // Subject Methods
        getSubject,
        createSubject,
        updateSubject,
        deleteSubject,
        // Question Methods
        getQuestion,
        getQuestions,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        // Search & Stats
        globalSearch,
        refreshState: syncState,
        // Legacy backward compatibility stubs
        decks: subjects,
        battles: [],
        friends: [],
        notifications: [],
        unreadNotificationsCount: 0
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
export default GameContext;
