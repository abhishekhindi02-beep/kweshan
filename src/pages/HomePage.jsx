import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Plus, FileText, Clock, Layers, Sparkles, 
  ArrowRight, FolderPlus, Search, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import SubjectCard from '../components/subjects/SubjectCard';
import SubjectModal from '../components/subjects/SubjectModal';
import QuestionCard from '../components/questions/QuestionCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    subjects, 
    questions, 
    stats, 
    createSubject, 
    updateSubject, 
    deleteSubject,
    deleteQuestion
  } = useGame();

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteDialogData, setDeleteDialogData] = useState(null); // { type: 'subject'|'question', item: {...} }

  const handleCreateSubjectSubmit = (data) => {
    if (editingSubject) {
      return updateSubject(editingSubject.id, data);
    }
    return createSubject(data);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = (subject) => {
    setDeleteDialogData({
      type: 'subject',
      item: subject,
      title: `Delete "${subject.name}"?`,
      message: `Are you sure you want to delete the subject "${subject.name}"? All questions stored in this subject will also be permanently deleted.`
    });
  };

  const handleDeleteQuestion = (question) => {
    setDeleteDialogData({
      type: 'question',
      item: question,
      title: 'Delete Question?',
      message: 'Are you sure you want to remove this question from your repository? This action cannot be undone.'
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialogData) return;
    if (deleteDialogData.type === 'subject') {
      deleteSubject(deleteDialogData.item.id);
    } else if (deleteDialogData.type === 'question') {
      deleteQuestion(deleteDialogData.item.id);
    }
    setDeleteDialogData(null);
  };

  const totalSubjects = stats?.totalSubjects ?? subjects.length;
  const totalQuestions = stats?.totalQuestions ?? questions.length;
  const recentQuestions = stats?.recentQuestions || questions.slice(0, 5);
  const recentlyUpdated = stats?.recentlyUpdated || questions.slice(0, 5);

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#101b33] to-[#090d16] border border-[#1e2d4d] p-6 sm:p-10 shadow-2xl shadow-black/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16233b] border border-[#223559] text-[#0df2c9] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>Kweshun Knowledge Repository</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Your Knowledge Repository
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed mb-6">
            Create subjects, organize your questions, and build your personal academic question library.
          </p>

          {/* Primary Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingSubject(null);
                setIsSubjectModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create Subject</span>
            </button>

            <button
              onClick={() => {
                if (subjects.length > 0) {
                  navigate(`/subjects/${subjects[0].id}/questions/new`);
                } else {
                  setEditingSubject(null);
                  setIsSubjectModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-white font-semibold text-sm border border-[#223252] hover:border-[#0df2c9]/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0df2c9]" />
              <span>+ Add Question</span>
            </button>

            <button
              onClick={() => navigate('/questions')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#131b2e] text-sm font-medium transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Library</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#0df2c9]/5 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Dynamic Summary Overview Stats (Calculated strictly from real user data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Total Subjects</span>
            <div className="w-8 h-8 rounded-xl bg-[#16233b] text-[#0df2c9] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalSubjects}
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            {totalSubjects === 1 ? '1 active academic subject' : `${totalSubjects} active academic subjects`}
          </p>
        </div>

        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Total Questions</span>
            <div className="w-8 h-8 rounded-xl bg-[#16233b] text-[#38bdf8] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalQuestions}
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            {totalQuestions === 1 ? '1 long-form question stored' : `${totalQuestions} long-form questions stored`}
          </p>
        </div>

        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Recently Added</span>
            <div className="w-8 h-8 rounded-xl bg-[#16233b] text-[#a855f7] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {recentQuestions.length}
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Questions in recent rotation
          </p>
        </div>

        <div className="bg-[#0f1626] border border-[#1b273f] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Repository Status</span>
            <div className="w-8 h-8 rounded-xl bg-[#16233b] text-[#0df2c9] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {totalSubjects > 0 ? 'Active & Synced' : 'Ready to Start'}
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Isolated to @{currentUser?.username || 'user'}
          </p>
        </div>
      </div>

      {/* Main Subjects Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Your Subjects</h2>
            <p className="text-xs text-[#94a3b8]">Organized academic fields and domains</p>
          </div>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0df2c9] hover:underline"
          >
            <span>View All Subjects ({totalSubjects})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.slice(0, 6).map((subj) => {
              const qCount = questions.filter(q => q.subjectId === subj.id).length;
              return (
                <SubjectCard
                  key={subj.id}
                  subject={subj}
                  questionCount={qCount}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title="No subjects yet."
            description="Create your first subject to start organizing your questions."
            actionLabel="+ Create Subject"
            actionIcon={FolderPlus}
            onAction={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
          />
        )}
      </section>

      {/* Recently Added Questions Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Recently Added Questions</h2>
            <p className="text-xs text-[#94a3b8]">Latest questions authored and saved in your library</p>
          </div>
          <Link
            to="/questions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0df2c9] hover:underline"
          >
            <span>View All Questions ({totalQuestions})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                showSubjectBadge={true}
                onEdit={(question) => navigate(`/subjects/${question.subjectId}/questions/${question.id}/edit`)}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No questions yet."
            description="Add your first question to start building your academic repository."
            actionLabel={subjects.length > 0 ? '+ Add Question' : '+ Create Subject First'}
            actionIcon={Plus}
            onAction={() => {
              if (subjects.length > 0) {
                navigate(`/subjects/${subjects[0].id}/questions/new`);
              } else {
                setEditingSubject(null);
                setIsSubjectModalOpen(true);
              }
            }}
          />
        )}
      </section>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleCreateSubjectSubmit}
        initialSubject={editingSubject}
        isEdit={Boolean(editingSubject)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteDialogData)}
        onClose={() => setDeleteDialogData(null)}
        onConfirm={handleConfirmDelete}
        title={deleteDialogData?.title}
        message={deleteDialogData?.message}
        confirmLabel="Delete"
        isDanger={true}
      />
    </div>
  );
}
