import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, BookOpen, Calendar, Clock, 
  Tag, FileText, Image as ImageIcon, PenTool, Sigma, Bookmark, 
  Share2, Check 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import MathRenderer from '../components/questions/MathRenderer';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function QuestionDetailPage() {
  const { subjectId: urlSubjectId, questionId } = useParams();
  const navigate = useNavigate();
  const { getQuestion, getSubject, deleteQuestion } = useGame();

  const question = getQuestion(questionId);
  const subject = question ? getSubject(question.subjectId) : null;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Fullscreen zoom

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <EmptyState
          icon={FileText}
          title="Question Not Found"
          description="The requested question could not be found in your repository."
          actionLabel="Back to Questions"
          actionIcon={ArrowLeft}
          onAction={() => navigate('/questions')}
        />
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    await deleteQuestion(question.id);
    setIsDeleteDialogOpen(false);
    if (subject) {
      navigate(`/subjects/${subject.id}`);
    } else {
      navigate('/questions');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    } catch (e) {
      return 'Recently';
    }
  };

  const images = question.attachments?.images || [];
  const drawings = question.attachments?.drawings || [];
  const equations = question.attachments?.equations || [];

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    hard: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  const diffKey = (question.difficulty || 'Medium').toLowerCase();
  const diffClass = difficultyColors[diffKey] || difficultyColors.medium;

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb Header & Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#94a3b8]">
          <Link to="/subjects" className="hover:text-white transition-colors">
            Subjects
          </Link>
          {subject && (
            <>
              <span>/</span>
              <Link to={`/subjects/${subject.id}`} className="hover:text-white transition-colors">
                {subject.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-white font-semibold truncate max-w-[150px] sm:max-w-xs">
            {question.topic || 'Question Details'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/subjects/${question.subjectId}/questions/${question.id}/edit`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#152037] hover:bg-[#1f2f50] text-[#cbd5e1] hover:text-white text-xs font-semibold border border-[#223252] transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Question View Card */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#1c273e]">
          {subject && (
            <Link
              to={`/subjects/${subject.id}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#16233b] border border-[#233558] text-[#0df2c9] text-xs font-semibold hover:border-[#0df2c9]/60 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{subject.name}</span>
            </Link>
          )}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${diffClass}`}>
            {question.difficulty || 'Medium'}
          </span>
          {question.topic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#131b2e] border border-[#1e2c47] text-[#94a3b8] text-xs font-medium">
              <Tag className="w-3 h-3" />
              <span>{question.topic}</span>
            </span>
          )}
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
            Problem / Question Statement
          </h2>
          <div className="text-base sm:text-lg font-medium text-white leading-relaxed whitespace-pre-wrap">
            {question.questionText}
          </div>
        </div>

        {/* Attachments Section */}
        {(images.length > 0 || drawings.length > 0 || equations.length > 0) && (
          <div className="space-y-4 pt-4 border-t border-[#1c273e]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Attachments & Visuals
            </h3>

            {/* Attached Images */}
            {images.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#94a3b8] flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Images</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedImage(img)}
                      className="rounded-xl overflow-hidden border border-[#223252] bg-[#0a0f1d] p-2 cursor-pointer hover:border-[#0df2c9]/50 transition-colors"
                    >
                      <img src={img} alt={`Diagram ${i + 1}`} className="w-full h-48 object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Hand-Drawn Figures */}
            {drawings.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#94a3b8] flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Hand-Drawn Figures</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {drawings.map((draw, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedImage(draw)}
                      className="rounded-xl overflow-hidden border border-[#223252] bg-[#090d16] p-2 cursor-pointer hover:border-[#0df2c9]/50 transition-colors"
                    >
                      <img src={draw} alt={`Figure ${i + 1}`} className="w-full h-48 object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Equations */}
            {equations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#94a3b8] flex items-center gap-1">
                  <Sigma className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>Governing Equations & Formulas</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {equations.map((eq, i) => (
                    <MathRenderer key={i} equation={eq} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes & Explanation */}
        {question.notes && (
          <div className="space-y-2 pt-4 border-t border-[#1c273e]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Notes & Solution Framework
            </h3>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1a253c] text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap font-sans">
              {question.notes}
            </div>
          </div>
        )}

        {/* Reference / Citation */}
        {question.citation && (
          <div className="space-y-1.5 pt-4 border-t border-[#1c273e]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
              Reference / Citation
            </h3>
            <p className="text-xs text-[#94a3b8] italic">
              {question.citation}
            </p>
          </div>
        )}

        {/* Footer Timestamps & Back button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1c273e] text-xs text-[#64748b]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formatDate(question.createdAt)}</span>
            </span>
            {question.updatedAt && question.updatedAt !== question.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatDate(question.updatedAt)}</span>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (subject) navigate(`/subjects/${subject.id}`);
              else navigate('/questions');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0df2c9] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {subject?.name || 'Questions'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Image Preview Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Enlarged Visual" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question?"
        message="Are you sure you want to remove this question from your repository? This action cannot be undone."
        confirmLabel="Delete"
        isDanger={true}
      />
    </div>
  );
}
