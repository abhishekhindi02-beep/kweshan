import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import QuestionsPage from './pages/QuestionsPage';
import BattlesPage from './pages/BattlesPage';
import DecksPage from './pages/DecksPage';
import FriendsPage from './pages/FriendsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

import BattlePlayModal from './components/battles/BattlePlayModal';
import LightningArenaModal from './components/battles/LightningArenaModal';
import QuickMatchModal from './components/battles/QuickMatchModal';
import BattleResultModal from './components/battles/BattleResultModal';
import ChallengeModal from './components/battles/ChallengeModal';
import DeckPracticeModal from './components/decks/DeckPracticeModal';
import ToastContainer from './components/common/ToastContainer';

import { useAuth } from './context/AuthContext';
import { useGame } from './context/GameContext';

// Protected Route Wrapper for Prototype App
function ProtectedRoute({ children, isAuthenticated, isRegistered }) {
  if (!isAuthenticated || !isRegistered) {
    return <Navigate to="/" replace />;
  }
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const { isAuthenticated, isRegistered } = useAuth();
  const { 
    questions, 
    decks, 
    battles, 
    practicingDeck, 
    setPracticingDeck,
    activeBattleId,
    setActiveBattleId,
    activeBattleData,
    setActiveBattleData
  } = useGame();

  // Global Modals state
  const [isLightningOpen, setIsLightningOpen] = useState(false);
  const [isQuickMatchOpen, setIsQuickMatchOpen] = useState(false);
  const [battleResultData, setBattleResultData] = useState(null);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  // Trigger Quick Match Matchmaking
  const handleOpenQuickMatch = () => {
    setIsQuickMatchOpen(true);
  };

  // Trigger Direct Battle Launch
  const handleLaunchBattle = (deckId = 'deck_1', battle = null) => {
    let battleQuestions = questions.filter((q) => !deckId || q.deckId === deckId);
    if (battleQuestions.length < 5) {
      battleQuestions = questions.slice(0, 5);
    } else {
      battleQuestions = battleQuestions.slice(0, 5);
    }

    const matchedDeck = decks.find((d) => d.id === deckId) || decks[0];

    const newBattle = {
      id: battle?.id || `btl_${Date.now()}`,
      deckId: matchedDeck ? matchedDeck.id : 'deck_1',
      deckName: matchedDeck ? matchedDeck.title : 'Academic Duel',
      subject: battle?.subject || matchedDeck?.title || 'Academic Face-Off',
      opponentName: battle?.opponentName || 'Abram Mango',
      opponentAvatar: battle?.opponentAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      opponentRank: battle?.opponentRank || 'Master Duelist',
      opponentLevel: battle?.opponentLevel || 12,
      accuracy: battle?.accuracy || 70,
      dpReward: battle?.dpReward || 120,
      dpLoss: battle?.dpLoss || 40,
      timeRemainingSeconds: battle?.timeRemainingSeconds || 15,
      questions: battleQuestions
    };

    setActiveBattleId(newBattle.id);
    setActiveBattleData(newBattle);
  };

  const handleBattleComplete = (result) => {
    console.log('Battle concluded:', result);
  };

  const handleStartPractice = (deckOrId) => {
    if (typeof deckOrId === 'string') {
      const found = decks.find((d) => d.id === deckOrId) || decks[0];
      setPracticingDeck(found);
    } else {
      setPracticingDeck(deckOrId);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#090d16] text-[#f8fafc] font-sans antialiased selection:bg-[#0df2c9]/30 selection:text-[#0df2c9]">
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route
            path="/"
            element={
              isAuthenticated && isRegistered ? (
                <AppShell>
                  <HomePage
                    onOpenBattle={handleOpenQuickMatch}
                    onOpenLightning={() => setIsLightningOpen(true)}
                    onStartPractice={handleStartPractice}
                  />
                </AppShell>
              ) : (
                <LandingPage />
              )
            }
          />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected Main Application Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <HomePage
                  onOpenBattle={handleOpenQuickMatch}
                  onOpenLightning={() => setIsLightningOpen(true)}
                  onStartPractice={handleStartPractice}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arena/lightning"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <HomePage
                  onOpenBattle={handleOpenQuickMatch}
                  onOpenLightning={() => setIsLightningOpen(true)}
                  onStartPractice={handleStartPractice}
                  autoOpenLightning={true}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/new"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id/analytics"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/battles"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <BattlesPage
                  onStartBattle={handleOpenQuickMatch}
                  onStartLightning={() => setIsLightningOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/battles/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <BattlesPage
                  onStartBattle={handleOpenQuickMatch}
                  onStartLightning={() => setIsLightningOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/battles/:id/play"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <BattlesPage
                  onStartBattle={handleOpenQuickMatch}
                  onStartLightning={() => setIsLightningOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/battles/:id/result"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <BattlesPage
                  onStartBattle={handleOpenQuickMatch}
                  onStartLightning={() => setIsLightningOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/battles/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <BattlesPage
                  onStartBattle={handleOpenQuickMatch}
                  onStartLightning={() => setIsLightningOpen(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <DecksPage
                  onStartPractice={handleStartPractice}
                  onStartBattle={handleLaunchBattle}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/decks/:deckId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <DecksPage
                  onStartPractice={handleStartPractice}
                  onStartBattle={handleLaunchBattle}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:deckId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <DecksPage
                  onStartPractice={handleStartPractice}
                  onStartBattle={handleLaunchBattle}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <NotificationsPage
                  onStartBattle={handleLaunchBattle}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isRegistered={isRegistered}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Global Modals Stack */}
        <QuickMatchModal
          isOpen={isQuickMatchOpen}
          onClose={() => setIsQuickMatchOpen(false)}
          onLaunchBattle={handleLaunchBattle}
        />

        <BattlePlayModal
          isOpen={Boolean(activeBattleData)}
          onClose={() => {
            setActiveBattleData(null);
            setActiveBattleId(null);
          }}
          battle={activeBattleData}
          onComplete={handleBattleComplete}
        />

        <LightningArenaModal
          isOpen={isLightningOpen}
          onClose={() => setIsLightningOpen(false)}
        />

        <BattleResultModal
          isOpen={Boolean(battleResultData)}
          onClose={() => setBattleResultData(null)}
          result={battleResultData}
          onRematch={() => {
            setBattleResultData(null);
            handleLaunchBattle(battleResultData?.deckId);
          }}
        />

        <ChallengeModal
          isOpen={isChallengeOpen}
          onClose={() => setIsChallengeOpen(false)}
        />

        <DeckPracticeModal
          isOpen={Boolean(practicingDeck)}
          onClose={() => setPracticingDeck(null)}
          deck={practicingDeck}
        />

        {/* Global Reactive Toasts */}
        <ToastContainer />
      </div>
    </Router>
  );
}
