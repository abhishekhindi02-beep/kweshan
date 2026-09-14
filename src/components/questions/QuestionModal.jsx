import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, CheckCircle2, AlertCircle, Save, Send, 
  HelpCircle, Image as ImageIcon, PenTool, Sigma, 
  Trash2, X, Plus, BookOpen, Check, Award
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import DrawingCanvasModal from './DrawingCanvasModal';
import { evaluateQuestionQuality } from '../../services/qualityScorer';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuestionModal({ isOpen, onClose, question = null }) {
  const { createQuestion, updateQuestion, decks } = useGame();
  const { user, currentUser } = useAuth();
  const effectiveUser = currentUser || user || { id: 'user_1', name: 'Dr. Elena Rostova' };
  const { showToast, addToast } = useToast();

  const fileInputRef = useRef(null);

  // Form State
  const [deckId, setDeckId] = useState('deck_1');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [prompt, setPrompt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [citation, setCitation] = useState('');
  const [tags, setTags] = useState('Academic, Long-form');

  // Attachments State
  const [image, setImage] = useState(null);
  const [drawing, setDrawing] = useState(null);
  const [equations, setEquations] = useState([]);
  const [equationInput, setEquationInput] = useState('');
  const [showEquationInput, setShowEquationInput] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (question) {
      setDeckId(question.deckId || 'deck_1');
      setTopic(question.topic || '');
      setDifficulty(question.difficulty || 'Medium');
      setPrompt(question.prompt || question.text || '');
      setExplanation(question.explanation || '');
      setCitation(question.citation || question.citations || '');
      setTags(Array.isArray(question.tags) ? question.tags.join(', ') : (question.tags || 'Academic, Long-form'));
      setImage(question.image || question.imageUrl || null);
      setDrawing(question.drawing || question.figure || null);
      setEquations(Array.isArray(question.equations) ? question.equations : (question.equation ? [question.equation] : []));
      setValidationErrors({});
      setIsSubmitting(false);
    } else {
      setDeckId(decks[0]?.id || 'deck_1');
      setTopic('');
      setDifficulty('Medium');
      setPrompt('');
      setExplanation('');
      setCitation('');
      setTags('Academic, Long-form');
      setImage(null);
      setDrawing(null);
      setEquations([]);
      setEquationInput('');
      setShowEquationInput(false);
      setValidationErrors({});
      setIsSubmitting(false);
    }
  }, [question, isOpen, decks]);

  // Live quality score calculation for long-form question
  const currentQData = {
    prompt,
    text: prompt,
    explanation,
    citation,
    citations: citation,
    difficulty,
    image,
    drawing,
    equations,
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
  };
  const liveScore = evaluateQuestionQuality(currentQData);

  // Handle Image File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      if (showToast) showToast('Image file size exceeds 3MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      if (showToast) showToast('Figure image attached successfully.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Add Equation to list
  const handleAddEquation = () => {
    if (!equationInput.trim()) return;
    setEquations((prev) => [...prev, equationInput.trim()]);
    setEquationInput('');
    setShowEquationInput(false);
  };

  const insertSymbol = (sym) => {
    setEquationInput((prev) => prev + sym);
  };

  const symbols = ['²', '³', '√', 'π', 'θ', 'Δ', '∫', '±', 'α', 'β', 'λ', 'μ', 'Σ', '∞', '→', '⇌'];

  const handlePublish = (targetStatus = 'Live') => {
    if (isSubmitting) return;

    const errors = {};
    if (!prompt.trim()) {
      errors.prompt = 'Long-form question prompt is required.';
    }
    if (!explanation.trim()) {
      errors.explanation = 'Please provide a solution, derivation, or canonical explanation.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      if (showToast) showToast(firstError, 'error');
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    const selectedDeck = decks.find((d) => d.id === deckId) || decks[0] || {
      id: 'deck_1',
      title: 'AP Physics 1: Mechanics',
      category: 'Science'
    };

    const finalTopic = topic.trim() || prompt.trim().slice(0, 45) + '...';

    const payload = {
      deckId: selectedDeck.id,
      deckName: selectedDeck.title,
      category: selectedDeck.category || 'Science',
      topic: finalTopic,
      prompt: prompt.trim(),
      text: prompt.trim(),
      explanation: explanation.trim(),
      citation: citation.trim(),
      citations: citation.trim(),
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: targetStatus,
      authorId: effectiveUser.id,
      authorName: effectiveUser.name || 'Scholar',
      image,
      drawing,
      equations,
      qualityScores: liveScore
    };

    try {
      if (question?.id) {
        updateQuestion(question.id, payload);
        if (showToast) showToast(`Question updated successfully (${targetStatus})!`, 'success');
      } else {
        createQuestion(payload);
        if (showToast) {
          if (targetStatus === 'Live') {
            showToast('Long-form question published successfully! +30 DP earned.', 'success');
          } else if (targetStatus === 'Pending Review') {
            showToast('Question submitted for peer review.', 'info');
          } else {
            showToast('Draft saved successfully.', 'success');
          }
        }
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to save long-form question', err);
      setIsSubmitting(false);
      if (showToast) showToast('Unable to save the question. Please try again.', 'error');
    }
  };

  const handleSaveDraft = () => {
    handlePublish('Draft');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={question ? 'Edit Long-Form Question' : 'Author Long-Form Question'}
        subtitle="Write academic problems with attached figures, freehand diagrams, and equations"
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* 1. Deck, Topic & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Deck / Topic *
                </label>
                <select
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                  className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0df2c9]"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Difficulty Level *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0df2c9]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Concept / Subtopic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Newton's Second Law"
                  className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#0df2c9]"
                />
              </div>
            </div>

            {/* 2. Long-Form Question Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Academic Question Prompt *
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {prompt.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (validationErrors.prompt) {
                    setValidationErrors((prev) => ({ ...prev, prompt: false }));
                  }
                }}
                placeholder="Write your long-form academic question in detail. e.g. 'Explain how Newton's second law can be used to determine the acceleration of an object when multiple non-orthogonal forces act on it. Derive the net vector sum equation...'"
                className={`w-full bg-[#0b101b] border rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors leading-relaxed ${
                  validationErrors.prompt ? 'border-rose-500/80' : 'border-[#22334d]'
                }`}
              />
              {validationErrors.prompt && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.prompt}
                </p>
              )}
            </div>

            {/* 3. Attachments Action Toolbar */}
            <div className="p-3 bg-[#111927] border border-[#22334d] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                  Attachments & Scientific Artifacts
                </span>
                <span className="text-[10px] font-mono text-slate-500">Optional Visuals</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Add Image Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#0b101b] hover:bg-[#1a233a] border border-[#22334d] hover:border-[#0df2c9]/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#0df2c9]" />
                  {image ? 'Change Image' : 'Add Image'}
                </button>

                {/* Draw Figure Button */}
                <button
                  type="button"
                  onClick={() => setIsDrawingModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#0b101b] hover:bg-[#1a233a] border border-[#22334d] hover:border-[#38bdf8]/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#38bdf8]" />
                  {drawing ? 'Edit Drawing' : 'Draw Figure'}
                </button>

                {/* Add Equation Button */}
                <button
                  type="button"
                  onClick={() => setShowEquationInput(!showEquationInput)}
                  className="px-3 py-1.5 rounded-xl bg-[#0b101b] hover:bg-[#1a233a] border border-[#22334d] hover:border-amber-400/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sigma className="w-3.5 h-3.5 text-amber-400" />
                  Add Equation
                </button>
              </div>

              {/* Equation Input Tray */}
              {showEquationInput && (
                <div className="p-3 bg-[#0b101b] border border-[#22334d] rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={equationInput}
                      onChange={(e) => setEquationInput(e.target.value)}
                      placeholder="e.g. F = ma, E = mc², v = u + at, ΣF = m·a"
                      className="flex-1 bg-[#111927] border border-[#22334d] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#0df2c9]"
                    />
                    <button
                      type="button"
                      onClick={handleAddEquation}
                      className="px-3 py-1.5 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Attach
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEquationInput(false)}
                      className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Math Symbols Helper Bar */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-500 font-mono mr-1">Symbols:</span>
                    {symbols.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSymbol(sym)}
                        className="px-2 py-0.5 rounded bg-[#111927] hover:bg-[#1f2d47] text-slate-300 font-mono text-xs border border-[#22334d] cursor-pointer"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Items Previews */}
              {(image || drawing || equations.length > 0) && (
                <div className="pt-2 border-t border-[#1b273a] space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Attached Artifacts:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Attached Image Preview */}
                    {image && (
                      <div className="relative p-2 bg-[#0b101b] border border-[#22334d] rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={image} alt="Uploaded" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                          <span className="text-xs text-slate-300 truncate">Figure Image</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Attached Drawing Preview */}
                    {drawing && (
                      <div className="relative p-2 bg-[#0b101b] border border-[#22334d] rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={drawing} alt="Diagram" className="w-10 h-10 object-contain bg-[#090d16] rounded-lg flex-shrink-0" />
                          <span className="text-xs text-slate-300 truncate">Hand-Drawn Figure</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setIsDrawingModalOpen(true)}
                            className="p-1 text-slate-400 hover:text-[#38bdf8] cursor-pointer"
                            title="Edit drawing"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDrawing(null)}
                            className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Remove drawing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attached Equations Pills */}
                  {equations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {equations.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#0b101b] border border-[#0df2c9]/30 text-[#0df2c9] text-xs font-mono flex items-center gap-1.5"
                        >
                          <span>{eq}</span>
                          <button
                            type="button"
                            onClick={() => setEquations(equations.filter((_, idx) => idx !== i))}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Long-Form Solution & Derivation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Solution, Proof & Explanation *
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {explanation.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={explanation}
                onChange={(e) => {
                  setExplanation(e.target.value);
                  if (validationErrors.explanation) {
                    setValidationErrors((prev) => ({ ...prev, explanation: false }));
                  }
                }}
                placeholder="Provide a comprehensive academic explanation, derivation, or canonical solution proving the principle..."
                className={`w-full bg-[#0b101b] border rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors leading-relaxed ${
                  validationErrors.explanation ? 'border-rose-500/80' : 'border-[#22334d]'
                }`}
              />
              {validationErrors.explanation && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.explanation}
                </p>
              )}
            </div>

            {/* 5. Reference / Citation */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Academic Reference / Citation (Optional)
              </label>
              <input
                type="text"
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="e.g. Halliday, Resnick, & Walker — Fundamentals of Physics (11th Ed., Ch. 5)"
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>

          {/* Right 1 Col: Quality Score & Guidelines */}
          <div className="space-y-4">
            {/* Live Quality Engine Rating Card */}
            <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                  Quality Score
                </span>
                <span className="text-xs font-extrabold text-[#0df2c9] font-mono">
                  {liveScore.composite}/100 ({liveScore.grade})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#0b101b] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0df2c9] to-[#8b5cf6] transition-all duration-300"
                  style={{ width: `${liveScore.composite}%` }}
                />
              </div>

              {/* Breakdown metrics */}
              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Question Depth:</span>
                  <span className="font-mono text-slate-200">{liveScore.originality}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Solution Rigor:</span>
                  <span className="font-mono text-slate-200">{liveScore.factualVerification}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Difficulty Balance:</span>
                  <span className="font-mono text-slate-200">{liveScore.difficultyBalance}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Scientific Figures:</span>
                  <span className="font-mono text-slate-200">{liveScore.answerDistinction}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Source Citations:</span>
                  <span className="font-mono text-slate-200">{liveScore.sourceCitations}%</span>
                </div>
              </div>

              {/* Recommendations */}
              {liveScore.recommendations.length > 0 && (
                <div className="p-2.5 bg-[#0b101b] border border-[#1f2d47] rounded-xl space-y-1 text-[11px] text-slate-400">
                  <span className="font-bold text-amber-400 block">💡 Tips to boost DP:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10px]">
                    {liveScore.recommendations.slice(0, 2).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Authoring Guidelines */}
            <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-4 space-y-2 text-xs text-slate-400">
              <h4 className="font-bold text-slate-300">Authoring Standards</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0df2c9] flex-shrink-0 mt-0.5" />
                  <span>Use precise academic terminology and units.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0df2c9] flex-shrink-0 mt-0.5" />
                  <span>Attach diagrams or formulas for complex models.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#0df2c9] flex-shrink-0 mt-0.5" />
                  <span>Direct live publication yields +30 DP instant royalties.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons Stack */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handlePublish('Live')}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Award className="w-4 h-4 fill-slate-950" />
                Publish Live (+30 DP)
              </button>

              <button
                type="button"
                onClick={() => handlePublish('Pending Review')}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#1b273a] hover:bg-[#25354e] text-white font-bold text-xs rounded-xl border border-[#2e4363] hover:border-[#0df2c9]/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#0df2c9]" />
                Submit for Peer Review
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-2 bg-[#111927] hover:bg-[#1a233a] text-slate-300 text-xs font-semibold rounded-xl border border-[#22334d] transition-colors cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-transparent hover:bg-[#111927] text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Freehand Drawing Modal */}
      <DrawingCanvasModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        initialDrawing={drawing}
        onSave={(dataUrl) => setDrawing(dataUrl)}
      />
    </>
  );
}
