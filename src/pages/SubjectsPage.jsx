import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, FolderPlus, Search, X, BookOpen, Plus } from 'lucide-react';
import { useGame } from '../context/GameContext';
import SubjectCard from '../components/subjects/SubjectCard';
import SubjectModal from '../components/subjects/SubjectModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function SubjectsPage() {
  const navigate = useNavigate();
  const { 
    subjects, 
    questions, 
    createSubject, 
    updateSubject, 
    deleteSubject 
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredSubjects = subjects.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    );
  });

  const handleModalSubmit = (data) => {
    if (editingSubject) {
      return updateSubject(editingSubject.id, data);
    }
    return createSubject(data);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = (subject) => {
    setDeleteTarget(subject);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSubject(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Subjects
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            Manage your academic subjects and curriculum domains
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSubject(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Create Subject</span>
        </button>
      </div>

      {/* Search Bar */}
      {subjects.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by name or description..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#0f1626] border border-[#1e2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Subjects Grid */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => {
            const qCount = questions.filter(q => q.subjectId === subject.id).length;
            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                questionCount={qCount}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      ) : subjects.length > 0 ? (
        <EmptyState
          icon={Search}
          title="No matching subjects"
          description={`No subjects found matching "${searchQuery}". Try clearing your search query.`}
          actionLabel="Clear Search"
          actionIcon={X}
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <EmptyState
          icon={Layers}
          title="No subjects yet."
          description="Create your first subject to start organizing your questions."
          actionLabel="+ Create Subject"
          actionIcon={FolderPlus}
          onAction={() => {
            setEditingSubject(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleModalSubmit}
        initialSubject={editingSubject}
        isEdit={Boolean(editingSubject)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message={`Are you sure you want to delete the subject "${deleteTarget?.name}"? All questions under this subject will also be permanently deleted.`}
        confirmLabel="Delete Subject"
        isDanger={true}
      />
    </div>
  );
}
