import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Search, X, Plus, Filter, ArrowUpDown, 
  Layers, BookOpen 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import QuestionCard from '../components/questions/QuestionCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function QuestionsPage() {
  const navigate = useNavigate();
  const { subjects, questions, getQuestions, deleteQuestion } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'updated' | 'alphabetical' | 'oldest'

  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredQuestions = useMemo(() => {
    return getQuestions({
      subjectId: selectedSubjectId,
      difficulty: selectedDifficulty,
      search: searchQuery,
      sort: sortBy
    });
  }, [getQuestions, selectedSubjectId, selectedDifficulty, searchQuery, sortBy]);

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteQuestion(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            Browse, search, and organize all questions across your academic subjects
          </p>
        </div>

        <button
          onClick={() => {
            if (subjects.length > 0) {
              const targetSubj = selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0].id;
              navigate(`/subjects/${targetSubj}/questions/new`);
            } else {
              navigate('/subjects');
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Question</span>
        </button>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-4 shadow-md space-y-3">
        {/* Search Field */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by text, topic, notes, formulas, citation, or subject..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Sorters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#19243c]">
          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748b]">Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-3 py-1.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-xs font-medium text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Subjects ({questions.length})</option>
                {subjects.map((s) => {
                  const count = questions.filter(q => q.subjectId === s.id).length;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748b]">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-1.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-xs font-medium text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#64748b]" />
            <span className="text-xs font-semibold text-[#64748b]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-xs font-medium text-white focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="updated">Recently Updated</option>
              <option value="alphabetical">Alphabetical (Topic/Title)</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Results List / Grid */}
      {filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              showSubjectBadge={true}
              onEdit={(question) => navigate(`/subjects/${question.subjectId}/questions/${question.id}/edit`)}
              onDelete={(question) => setDeleteTarget(question)}
            />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <EmptyState
          icon={Search}
          title="No questions found"
          description="No questions match your current search query and filters."
          actionLabel="Clear Filters"
          actionIcon={X}
          onAction={() => {
            setSearchQuery('');
            setSelectedSubjectId('all');
            setSelectedDifficulty('all');
          }}
        />
      ) : (
        <EmptyState
          icon={FileText}
          title="No questions in your repository"
          description="Create your first subject and add long-form questions to build your library."
          actionLabel={subjects.length > 0 ? '+ Add Question' : '+ Create Subject'}
          actionIcon={Plus}
          onAction={() => {
            if (subjects.length > 0) {
              navigate(`/subjects/${subjects[0].id}/questions/new`);
            } else {
              navigate('/subjects');
            }
          }}
        />
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Question?"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
      />
    </div>
  );
}
