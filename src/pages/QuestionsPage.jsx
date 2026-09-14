import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Sparkles, CheckCircle2, Clock, FileText, BookOpen } from 'lucide-react';
import QualityDashboard from '../components/questions/QualityDashboard';
import QuestionCard from '../components/questions/QuestionCard';
import QuestionModal from '../components/questions/QuestionModal';
import QuestionDetailModal from '../components/questions/QuestionDetailModal';
import Badge from '../components/common/Badge';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function QuestionsPage() {
  const { questions, decks, approveQuestion, rejectQuestion, deleteQuestion, submitForReview } = useGame();
  const { user, currentUser } = useAuth();
  const effectiveUser = currentUser || user || { id: 'user_1', name: 'Dr. Elena Rostova' };
  const { showToast } = useToast();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('my'); // my, all, approved, pending, draft
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingDetailQuestion, setViewingDetailQuestion] = useState(null);

  // Sync route state with modals
  useEffect(() => {
    if (location.pathname === '/questions/new') {
      setIsAuthorModalOpen(true);
      setEditingQuestion(null);
    } else if (params.id && questions.length > 0) {
      const targetQ = questions.find((q) => q.id === params.id);
      if (targetQ) {
        setViewingDetailQuestion(targetQ);
      }
    }
  }, [location.pathname, params.id, questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const statusLower = (q.status || '').toLowerCase();
      
      // Tab filter
      if (activeTab === 'my') {
        if (q.authorId !== effectiveUser.id) return false;
      } else if (activeTab === 'approved') {
        if (statusLower !== 'approved' && statusLower !== 'live') return false;
      } else if (activeTab === 'pending') {
        if (statusLower !== 'pending' && statusLower !== 'pending review') return false;
      } else if (activeTab === 'draft') {
        if (statusLower !== 'draft') return false;
      }

      // Deck filter
      if (selectedDeck !== 'all' && q.deckId !== selectedDeck) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && (q.difficulty || '').toLowerCase() !== selectedDifficulty.toLowerCase()) return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPrompt = (q.prompt || q.text || '').toLowerCase().includes(query);
        const matchesTopic = (q.topic || '').toLowerCase().includes(query);
        const matchesDeck = (q.deckName || '').toLowerCase().includes(query);
        const matchesCitation = (q.citation || q.citations || '').toLowerCase().includes(query);
        if (!matchesPrompt && !matchesTopic && !matchesDeck && !matchesCitation) return false;
      }

      return true;
    });
  }, [questions, activeTab, selectedDeck, selectedDifficulty, searchQuery, effectiveUser.id]);

  const handleEdit = (q) => {
    setEditingQuestion(q);
    setIsAuthorModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingQuestion(null);
    setIsAuthorModalOpen(true);
  };

  const handleApprove = (qId) => {
    approveQuestion(qId);
  };

  const handleReject = (qId) => {
    rejectQuestion(qId);
  };

  const handleDelete = (qId) => {
    deleteQuestion(qId);
  };

  const handleSubmitForReview = (qId) => {
    submitForReview(qId);
  };

  // Tab counts
  const userAuthoredQuestions = questions.filter((q) => q.authorId === effectiveUser.id);
  const countMy = userAuthoredQuestions.length;
  const countAll = questions.length;
  const countApproved = questions.filter(
    (q) => (q.status || '').toLowerCase() === 'live' || (q.status || '').toLowerCase() === 'approved'
  ).length;
  const countPending = questions.filter(
    (q) => (q.status || '').toLowerCase() === 'pending' || (q.status || '').toLowerCase() === 'pending review'
  ).length;
  const countDraft = questions.filter((q) => (q.status || '').toLowerCase() === 'draft').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#0df2c9]" />
            Long-Form Question Authoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author comprehensive academic questions with attached diagrams, freehand drawings, and mathematical proofs.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Author Question (+30 DP)
        </button>
      </div>

      {/* Quality Engine Metrics Dashboard */}
      <QualityDashboard questions={questions} />

      {/* Filters and Search Bar */}
      <div className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl space-y-4 shadow-sm">
        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[#22334d] pb-3 overflow-x-auto">
          {[
            { id: 'my', label: 'My Authored Questions', count: countMy },
            { id: 'all', label: 'All Repository', count: countAll },
            { id: 'approved', label: 'Live / Approved', count: countApproved },
            { id: 'pending', label: 'Peer Review', count: countPending },
            { id: 'draft', label: 'Drafts', count: countDraft }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0df2c9] text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  activeTab === tab.id ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-[#1b273a] text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, concept, equation, or citation..."
              className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
              className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0df2c9]"
            >
              <option value="all">All Academic Topics</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0df2c9]"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Grid & Realistic Empty States */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-[#111927] border border-[#22334d] rounded-3xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {activeTab === 'my' ? 'No questions created yet' : 'No questions found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'my'
              ? 'Author your first long-form written question with attachments to earn +30 DP royalties!'
              : 'Try adjusting your search query or filters to find questions in the academic repository.'}
          </p>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-black text-xs rounded-xl inline-flex items-center gap-1.5 mt-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Author First Question
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onEdit={handleEdit}
              onViewDetails={(question) => setViewingDetailQuestion(question)}
              onDelete={handleDelete}
              onSubmitReview={handleSubmitForReview}
              onDemoApprove={handleApprove}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Authoring & Editing Modal */}
      <QuestionModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        question={editingQuestion}
      />

      {/* Question Full Details Modal */}
      <QuestionDetailModal
        isOpen={Boolean(viewingDetailQuestion)}
        onClose={() => setViewingDetailQuestion(null)}
        question={viewingDetailQuestion}
        onEdit={handleEdit}
      />
    </div>
  );
}
