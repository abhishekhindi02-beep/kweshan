import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Check } from 'lucide-react';
import Modal from '../common/Modal';

export default function SubjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialSubject = null,
  isEdit = false
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialSubject && isEdit) {
        setName(initialSubject.name || '');
        setDescription(initialSubject.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialSubject, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a subject name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        name: cleanName,
        description: description.trim()
      });

      if (res && res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save subject.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Subject' : 'Create New Subject'}
      subtitle={isEdit ? 'Update subject details and organization' : 'Add a dedicated academic subject to organize your questions'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
            Subject Name <span className="text-[#0df2c9]">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Physics, Mathematics, Biology..."
            className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
            Description <span className="text-[#64748b] font-normal text-[11px]">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of topics, chapters, or syllabus covered in this subject..."
            className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c273e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#152037] hover:bg-[#1a2640] text-[#94a3b8] hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4" />
            <span>{isEdit ? 'Save Changes' : 'Create Subject'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
