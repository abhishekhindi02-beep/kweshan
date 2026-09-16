import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Plus, Edit2, Trash2, ArrowLeft, Search, X, 
  FileText, Calendar, Clock, Layers, Filter 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import QuestionCard from '../components/questions/QuestionCard';
import SubjectModal from '../components/subjects/SubjectModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { 
    getSubject, 
    getQuestions, 
    updateSubject, 
    deleteSubject,
    deleteQuestion 
  } = useGame();

  const subject = getSubject(subjectId);
  const allSubjectQuestions = useMemo(() => {
    return getQuestions({ subjectId });
  }, [getQuestions, subjectId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState(false);
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);

  const filteredQuestions = useMemo(() => {
    return allSubjectQuestions.filter((q) => {
      if (selectedDifficulty !== 'all' && (q.difficulty || '').toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesText = (q.questionText || '').toLowerCase().includes(query);
        const matchesTopic = (q.topic || '').toLowerCase().includes(query);
        const matchesNotes = (q.notes || '').toLowerCase().includes(query);
        const matchesCitation = (q.citation || '').toLowerCase().includes(query);
        return matchesText || matchesTopic || matchesNotes || matchesCitation;
      }
      return true;
    });
  }, [allSubjectQuestions, searchQuery, selectedDifficulty]);

  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <EmptyState
          icon={BookOpen}
          title="Subject Not Found"
          description="The requested subject could not be located in your repository."
          actionLabel="Back to Subjects"
          actionIcon={ArrowLeft}
          onAction={() => navigate('/subjects')}
        />
      </div>
    );
  }

  const handleEditSubjectSubmit = async (data) => {
    return await updateSubject(subject.id, data);
  };

  const handleConfirmDeleteSubject = async () => {
    const res = await deleteSubject(subject.id);
    if (!res?.error) {
      setIsDeleteSubjectOpen(false);
      navigate('/subjects');
    }
  };

  const handleConfirmDeleteQuestion = async () => {
    if (deleteQuestionTarget) {
      const res = await deleteQuestion(deleteQuestionTarget.id);
      if (!res?.error) {
        setDeleteQuestionTarget(null);
      }
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#94a3b8]">
        <Link to="/subjects" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Subjects</span>
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">{subject.name}</span>
      </div>

      {/* Subject Header Card */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#16233b] border border-[#223559] text-[#0df2c9] text-xs font-semibold">
                <FileText className="w-3.5 h-3.5" />
                <span>{allSubjectQuestions.length} {allSubjectQuestions.length === 1 ? 'Question' : 'Questions'}</span>
              </span>
              <span className="text-xs text-[#64748b]">
                Created {formatDate(subject.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {subject.name}
            </h1>

            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {subject.description || 'No description provided for this academic domain.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(`/subjects/${subject.id}/questions/new`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Question</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#cbd5e1] hover:text-white text-sm font-semibold border border-[#223252] transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => setIsDeleteSubjectOpen(true)}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Questions Section Header & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Questions in this Subject
            </h2>
            <p className="text-xs text-[#94a3b8]">
              {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'} available
            </p>
          </div>

          {/* Controls: Search + Difficulty Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-9 pr-8 py-2 bg-[#0f1626] border border-[#1e2d4d] focus:border-[#0df2c9] rounded-xl text-xs sm:text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex rounded-xl bg-[#0f1626] border border-[#1e2d4d] p-1">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    selectedDifficulty === diff ? 'bg-[#0df2c9] text-slate-950 font-bold shadow-sm' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Grid */}
        {filteredQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={{ ...q, subjectName: subject.name }}
                showSubjectBadge={false}
                onEdit={(question) => navigate(`/subjects/${subject.id}/questions/${question.id}/edit`)}
                onDelete={(question) => setDeleteQuestionTarget(question)}
              />
            ))}
          </div>
        ) : allSubjectQuestions.length > 0 ? (
          <EmptyState
            icon={Search}
            title="No matching questions"
            description="No questions match your current search and difficulty filters."
            actionLabel="Reset Filters"
            actionIcon={X}
            onAction={() => {
              setSearchQuery('');
              setSelectedDifficulty('all');
            }}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="No questions yet."
            description="Add your first question to this subject."
            actionLabel="+ Add Question"
            actionIcon={Plus}
            onAction={() => navigate(`/subjects/${subject.id}/questions/new`)}
          />
        )}
      </div>

      {/* Edit Subject Modal */}
      <SubjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubjectSubmit}
        initialSubject={subject}
        isEdit={true}
      />

      {/* Delete Subject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteSubjectOpen}
        onClose={() => setIsDeleteSubjectOpen(false)}
        onConfirm={handleConfirmDeleteSubject}
        title={`Delete "${subject.name}"?`}
        message={`Are you sure you want to delete this subject? All ${allSubjectQuestions.length} questions in "${subject.name}" will also be permanently deleted.`}
        confirmLabel="Delete Subject"
        isDanger={true}
      />

      {/* Delete Question Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteQuestionTarget)}
        onClose={() => setDeleteQuestionTarget(null)}
        onConfirm={handleConfirmDeleteQuestion}
        title="Delete Question?"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
      />
    </div>
  );
}
