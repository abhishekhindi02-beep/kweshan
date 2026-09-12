import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
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

export default function App() {
  const { isAuthenticated } = useAuth();
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
    // Battle complete handler
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
          {/* Public Auth Routes redirect directly to Dashboard (No Login Wall for Prototype) */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          {/* Main Prototype Application Routes with AppShell */}
          <Route
            path="/*"
            element={
              <AppShell>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        onOpenBattle={handleOpenQuickMatch}
                        onOpenLightning={() => setIsLightningOpen(true)}
                        onStartPractice={handleStartPractice}
                      />
                    }
                  />
                  <Route
                    path="/home"
                    element={
                      <HomePage
                        onOpenBattle={handleOpenQuickMatch}
                        onOpenLightning={() => setIsLightningOpen(true)}
                        onStartPractice={handleStartPractice}
                      />
                    }
                  />
                  <Route
                    path="/arena/lightning"
                    element={
                      <HomePage
                        onOpenBattle={handleOpenQuickMatch}
                        onOpenLightning={() => setIsLightningOpen(true)}
                        onStartPractice={handleStartPractice}
                        autoOpenLightning={true}
                      />
                    }
                  />
                  <Route path="/questions" element={<QuestionsPage />} />
                  <Route path="/questions/new" element={<QuestionsPage />} />
                  <Route path="/questions/:id" element={<QuestionsPage />} />
                  <Route path="/questions/:id/analytics" element={<QuestionsPage />} />
                  <Route path="/questions/*" element={<QuestionsPage />} />
                  <Route
                    path="/battles"
                    element={
                      <BattlesPage
                        onStartBattle={handleOpenQuickMatch}
                        onStartLightning={() => setIsLightningOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/battles/:id"
                    element={
                      <BattlesPage
                        onStartBattle={handleOpenQuickMatch}
                        onStartLightning={() => setIsLightningOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/battles/:id/play"
                    element={
                      <BattlesPage
                        onStartBattle={handleOpenQuickMatch}
                        onStartLightning={() => setIsLightningOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/battles/:id/result"
                    element={
                      <BattlesPage
                        onStartBattle={handleOpenQuickMatch}
                        onStartLightning={() => setIsLightningOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/battles/*"
                    element={
                      <BattlesPage
                        onStartBattle={handleOpenQuickMatch}
                        onStartLightning={() => setIsLightningOpen(true)}
                      />
                    }
                  />
                  <Route
                    path="/decks"
                    element={
                      <DecksPage
                        onStartPractice={handleStartPractice}
                        onStartBattle={handleLaunchBattle}
                      />
                    }
                  />
                  <Route
                    path="/decks/:deckId"
                    element={
                      <DecksPage
                        onStartPractice={handleStartPractice}
                        onStartBattle={handleLaunchBattle}
                      />
                    }
                  />
                  <Route
                    path="/practice/:deckId"
                    element={
                      <DecksPage
                        onStartPractice={handleStartPractice}
                        onStartBattle={handleLaunchBattle}
                      />
                    }
                  />
                  <Route path="/friends" element={<FriendsPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route
                    path="/notifications"
                    element={
                      <NotificationsPage
                        onStartBattle={handleLaunchBattle}
                      />
                    }
                  />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AppShell>
            }
          />
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
