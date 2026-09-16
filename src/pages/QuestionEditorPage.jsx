import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, Plus, Image as ImageIcon, PenTool, Sigma, 
  Trash2, Edit2, AlertCircle, BookOpen, Layers, Sparkles 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import DrawingCanvasModal from '../components/questions/DrawingCanvasModal';
import EquationEditorModal from '../components/questions/EquationEditorModal';
import ImageAttachmentModal from '../components/questions/ImageAttachmentModal';
import MathRenderer from '../components/questions/MathRenderer';

export default function QuestionEditorPage() {
  const { subjectId: urlSubjectId, questionId } = useParams();
  const navigate = useNavigate();
  const { 
    subjects, 
    getSubject, 
    getQuestion, 
    createQuestion, 
    updateQuestion 
  } = useGame();

  const isEdit = Boolean(questionId);
  const existingQuestion = isEdit ? getQuestion(questionId) : null;

  // Form State
  const [subjectId, setSubjectId] = useState(urlSubjectId || existingQuestion?.subjectId || (subjects[0]?.id || ''));
  const [questionText, setQuestionText] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [citation, setCitation] = useState('');

  // Attachments State
  const [images, setImages] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [equations, setEquations] = useState([]);

  // Modals state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [drawingEditIndex, setDrawingEditIndex] = useState(null);
  const [isEquationModalOpen, setIsEquationModalOpen] = useState(false);
  const [equationEditIndex, setEquationEditIndex] = useState(null);

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing question for editing
  useEffect(() => {
    if (isEdit && existingQuestion) {
      setSubjectId(existingQuestion.subjectId || '');
      setQuestionText(existingQuestion.questionText || '');
      setTopic(existingQuestion.topic || '');
      setDifficulty(existingQuestion.difficulty || 'Medium');
      setNotes(existingQuestion.notes || '');
      setCitation(existingQuestion.citation || '');
      setImages(existingQuestion.attachments?.images || []);
      setDrawings(existingQuestion.attachments?.drawings || []);
      setEquations(existingQuestion.attachments?.equations || []);
    } else if (!isEdit && urlSubjectId) {
      setSubjectId(urlSubjectId);
    } else if (!isEdit && subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [isEdit, existingQuestion, urlSubjectId, subjects]);

  const currentSubject = getSubject(subjectId) || subjects.find(s => s.id === subjectId) || subjects[0];

  // Attachment Handlers
  const handleAddImage = (imgData) => {
    setImages((prev) => [...prev, imgData]);
  };

  const handleRemoveImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDrawing = (drawingData) => {
    if (drawingEditIndex !== null) {
      setDrawings((prev) => {
        const next = [...prev];
        next[drawingEditIndex] = drawingData;
        return next;
      });
      setDrawingEditIndex(null);
    } else {
      setDrawings((prev) => [...prev, drawingData]);
    }
  };

  const handleRemoveDrawing = (idx) => {
    setDrawings((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveEquation = (eqStr) => {
    if (equationEditIndex !== null) {
      setEquations((prev) => {
        const next = [...prev];
        next[equationEditIndex] = eqStr;
        return next;
      });
      setEquationEditIndex(null);
    } else {
      setEquations((prev) => [...prev, eqStr]);
    }
  };

  const handleRemoveEquation = (idx) => {
    setEquations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanText = questionText.trim();
    if (!cleanText) {
      setError('Please write your long-form question.');
      return;
    }

    if (!subjectId) {
      setError('Please select a subject for this question.');
      return;
    }

    setIsSaving(true);
    const payload = {
      subjectId,
      questionText: cleanText,
      topic: topic.trim() || cleanText.slice(0, 45),
      difficulty,
      notes: notes.trim(),
      citation: citation.trim(),
      attachments: {
        images,
        drawings,
        equations
      }
    };

    try {
      let result;
      if (isEdit) {
        result = await updateQuestion(questionId, payload);
      } else {
        result = await createQuestion(payload);
      }

      if (result && result.error) {
        setError(result.error);
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
      // Navigate back to subject or question details
      if (isEdit) {
        navigate(`/subjects/${payload.subjectId}/questions/${result?.question?.id || questionId}`);
      } else {
        navigate(`/subjects/${payload.subjectId}`);
      }
    } catch (err) {
      setError(err?.message || 'Failed to save question.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#94a3b8]">
          <Link to={subjectId ? `/subjects/${subjectId}` : '/questions'} className="hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentSubject ? currentSubject.name : 'Back'}</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{isEdit ? 'Edit Question' : 'New Question'}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Editor Form Card */}
      <div className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 pb-5 border-b border-[#1c273e]">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isEdit ? 'Edit Academic Question' : 'Author Long-Form Question'}
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            Formulate detailed, rigorous academic questions with optional diagrams, proofs, and equations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject & Difficulty Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                Subject <span className="text-[#0df2c9]">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white focus:outline-none transition-colors cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white focus:outline-none transition-colors cursor-pointer"
              >
                <option value="Easy">Easy (Fundamental)</option>
                <option value="Medium">Medium (Standard Academic)</option>
                <option value="Hard">Hard (Advanced Proof / Derivation)</option>
              </select>
            </div>
          </div>

          {/* Topic / Concept Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Topic / Academic Concept <span className="text-[#64748b] font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton's Second Law & Cartesian Resolution, Eigenvalue Diagonalization..."
              className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
            />
          </div>

          {/* Question Text (Large Long-Form Editor) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Question Text <span className="text-[#0df2c9]">*</span>
            </label>
            <textarea
              rows={6}
              required
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Write the complete question prompt, problem statement, or theoretical derivation request..."
              className="w-full px-4 py-3 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                Attachments & Visuals
              </label>
              <span className="text-[11px] text-[#64748b]">Images, hand-drawn figures, formulas</span>
            </div>

            {/* Attachment Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#38bdf8] hover:text-white border border-[#223252] text-xs font-semibold transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Add Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDrawingEditIndex(null);
                  setIsDrawingModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#a855f7] hover:text-white border border-[#223252] text-xs font-semibold transition-colors cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>+ Draw Figure</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEquationEditIndex(null);
                  setIsEquationModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#152037] hover:bg-[#1d2c4b] text-[#fbbf24] hover:text-white border border-[#223252] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sigma className="w-3.5 h-3.5" />
                <span>+ Add Equation</span>
              </button>
            </div>

            {/* Attached Items Gallery Preview */}
            <div className="space-y-3 pt-2">
              {/* Attached Images */}
              {images.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                    Images ({images.length})
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-[#223252] bg-[#0a0f1d] p-1.5">
                        <img src={img} alt={`Attachment ${i + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Drawings */}
              {drawings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                    Hand-Drawn Figures ({drawings.length})
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {drawings.map((draw, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-[#223252] bg-[#090d16] p-1.5">
                        <img src={draw} alt={`Figure ${i + 1}`} className="w-32 h-20 object-contain rounded-lg" />
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setDrawingEditIndex(i);
                              setIsDrawingModalOpen(true);
                            }}
                            className="p-1 rounded-full bg-slate-800 text-white hover:bg-slate-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDrawing(i)}
                            className="p-1 rounded-full bg-rose-600 text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Equations */}
              {equations.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                    Equations ({equations.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {equations.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a0f1d] border border-[#1f2d47]">
                        <MathRenderer equation={eq} isBlock={false} />
                        <div className="flex items-center gap-1 ml-2 border-l border-[#223252] pl-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEquationEditIndex(i);
                              setIsEquationModalOpen(true);
                            }}
                            className="text-[#64748b] hover:text-white cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEquation(i)}
                            className="text-[#64748b] hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes / Canonical Proof Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Notes & Solution Guide <span className="text-[#64748b] font-normal text-[11px]">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key physical assumptions, derivation steps, or rubric guidance for this question..."
              className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* Citation / Source Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Reference / Citation <span className="text-[#64748b] font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="e.g. Halliday & Resnick 11th Ed. Ch. 5, Stewart Calculus 9th Ed. Sec 5.3..."
              className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c273e]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-[#152037] hover:bg-[#1a2640] text-[#94a3b8] hover:text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !questionText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : (isEdit ? 'Update Question' : 'Save Question')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Attachment Modals */}
      <ImageAttachmentModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSave={handleAddImage}
      />

      <DrawingCanvasModal
        isOpen={isDrawingModalOpen}
        onClose={() => {
          setIsDrawingModalOpen(false);
          setDrawingEditIndex(null);
        }}
        onSave={handleSaveDrawing}
        initialDrawing={drawingEditIndex !== null ? drawings[drawingEditIndex] : null}
      />

      <EquationEditorModal
        isOpen={isEquationModalOpen}
        onClose={() => {
          setIsEquationModalOpen(false);
          setEquationEditIndex(null);
        }}
        onSave={handleSaveEquation}
        initialEquation={equationEditIndex !== null ? equations[equationEditIndex] : ''}
      />
    </div>
  );
}
