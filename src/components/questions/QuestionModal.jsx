import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Save, Send, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { evaluateQuestionQuality } from '../../services/qualityScorer';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function QuestionModal({ isOpen, onClose, question = null }) {
  const { createQuestion, updateQuestion, decks } = useGame();
  const { user, currentUser } = useAuth();
  const effectiveUser = currentUser || user || { id: 'user_1', name: 'Kianna Torff' };
  const { showToast, addToast } = useToast();

  const [deckId, setDeckId] = useState('deck_1');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [citation, setCitation] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tags, setTags] = useState('General, Competitive');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (question) {
      setDeckId(question.deckId || 'deck_1');
      setTopic(question.topic || '');
      setPrompt(question.prompt || question.text || '');
      
      // Extract string options
      const rawOpts = question.options || ['', '', '', ''];
      const stringOpts = rawOpts.map((o) => (typeof o === 'string' ? o : o.text || ''));
      while (stringOpts.length < 4) stringOpts.push('');
      setOptions(stringOpts.slice(0, 4));
      
      const correctIdx = typeof question.correctAnswerIndex === 'number'
        ? question.correctAnswerIndex
        : (typeof question.correctIndex === 'number' ? question.correctIndex : 0);
      setCorrectIndex(correctIdx);

      setExplanation(question.explanation || '');
      setCitation(question.citation || question.citations || '');
      setDifficulty(question.difficulty || 'Medium');
      setTags(Array.isArray(question.tags) ? question.tags.join(', ') : (question.tags || ''));
      setValidationErrors({});
      setIsSubmitting(false);
    } else {
      setDeckId(decks[0]?.id || 'deck_1');
      setTopic('');
      setPrompt('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setExplanation('');
      setCitation('');
      setDifficulty('Medium');
      setTags('General, Competitive');
      setValidationErrors({});
      setIsSubmitting(false);
    }
  }, [question, isOpen, decks]);

  // Live quality score calculation
  const currentQData = {
    prompt,
    text: prompt,
    options,
    explanation,
    citation,
    citations: citation,
    difficulty,
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
  };
  const liveScore = evaluateQuestionQuality(currentQData);

  const handleOptionChange = (idx, val) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
    if (validationErrors[`option_${idx}`]) {
      setValidationErrors((prev) => ({ ...prev, [`option_${idx}`]: false }));
    }
  };

  const handlePublish = (targetStatus = 'Live') => {
    if (isSubmitting) return;

    const errors = {};

    if (!prompt.trim()) {
      errors.prompt = 'Question prompt is required.';
    }

    options.forEach((opt, i) => {
      if (!opt.trim()) {
        errors[`option_${i}`] = `Option ${String.fromCharCode(65 + i)} cannot be empty.`;
      }
    });

    if (correctIndex === null || correctIndex === undefined || correctIndex < 0 || correctIndex > 3) {
      errors.correct = 'Please select a correct answer option.';
    }

    if (!explanation.trim()) {
      errors.explanation = 'Please provide a solution and explanation.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      if (showToast) {
        showToast(firstError, 'error');
      } else if (addToast) {
        addToast({ title: 'Validation Error', message: firstError, type: 'error' });
      }
      return;
    }

    // Clear validation errors
    setValidationErrors({});
    setIsSubmitting(true);

    const selectedDeck = decks.find((d) => d.id === deckId) || decks[0] || {
      id: 'deck_1',
      title: 'AP Physics 1: Mechanics'
    };

    const finalTopic = topic.trim() || prompt.trim().slice(0, 45) + '...';

    const payload = {
      deckId: selectedDeck.id,
      deckName: selectedDeck.title,
      category: selectedDeck.category || 'Science',
      topic: finalTopic,
      prompt: prompt.trim(),
      text: prompt.trim(),
      options: options.map((o) => o.trim()),
      correctAnswerIndex: Number(correctIndex),
      correctIndex: Number(correctIndex),
      explanation: explanation.trim(),
      citation: citation.trim(),
      citations: citation.trim(),
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: targetStatus,
      authorId: effectiveUser.id,
      authorName: effectiveUser.name || 'Kianna Torff'
    };

    try {
      if (question?.id) {
        updateQuestion(question.id, payload);
        if (showToast) {
          showToast(`Question updated successfully (${targetStatus})!`, 'success');
        }
      } else {
        createQuestion(payload);
        if (showToast) {
          if (targetStatus === 'Live') {
            showToast('Question published successfully! +30 DP earned.', 'success');
          } else if (targetStatus === 'Pending Review') {
            showToast('Question submitted for review.', 'info');
          } else {
            showToast('Draft saved successfully.', 'success');
          }
        }
      }

      // Reset state and close modal
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to publish question', err);
      setIsSubmitting(false);
      if (showToast) showToast('Unable to publish the question. Please try again.', 'error');
    }
  };

  const handleSaveDraft = () => {
    if (isSubmitting) return;

    const selectedDeck = decks.find((d) => d.id === deckId) || decks[0] || { id: 'deck_1', title: 'Academic Deck' };
    const finalPrompt = prompt.trim() || 'Untitled Draft Question';
    const finalTopic = topic.trim() || 'Draft Concept';

    const payload = {
      deckId: selectedDeck.id,
      deckName: selectedDeck.title,
      category: selectedDeck.category || 'Science',
      topic: finalTopic,
      prompt: finalPrompt,
      text: finalPrompt,
      options: options.map((o) => o.trim()),
      correctAnswerIndex: Number(correctIndex),
      correctIndex: Number(correctIndex),
      explanation: explanation.trim(),
      citation: citation.trim(),
      citations: citation.trim(),
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'Draft',
      authorId: effectiveUser.id,
      authorName: effectiveUser.name || 'Kianna Torff'
    };

    if (question?.id) {
      updateQuestion(question.id, payload);
    } else {
      createQuestion(payload);
    }

    if (showToast) showToast('Draft saved successfully.', 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Edit Question' : 'Author New Competition Question'}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Deck / Topic *
              </label>
              <select
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#0df2c9]"
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
                className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#0df2c9]"
              >
                <option value="Easy">Easy (Foundation)</option>
                <option value="Medium">Medium (Standard Competition)</option>
                <option value="Hard">Hard (Grandmaster Rank)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Concept Subtopic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Rotational Inertia, Cell Division, Gibbs Energy..."
              className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Question Prompt *
              </label>
              {validationErrors.prompt && (
                <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.prompt}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (validationErrors.prompt) setValidationErrors((prev) => ({ ...prev, prompt: null }));
              }}
              placeholder="e.g. Which phase of the cell cycle is characterized by the division of the nucleus into two genetically identical nuclei?"
              className={`w-full bg-[#111927] border rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                validationErrors.prompt ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#22334d] focus:border-[#0df2c9]'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                4 Multiple Choice Options (Select exactly one correct answer) *
              </label>
              {validationErrors.correct && (
                <span className="text-[11px] text-rose-400 font-medium">{validationErrors.correct}</span>
              )}
            </div>
            <div className="space-y-2.5">
              {options.map((opt, idx) => {
                const labelLetter = String.fromCharCode(65 + idx);
                const isSelected = correctIndex === idx;
                const hasError = validationErrors[`option_${idx}`];

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                      hasError
                        ? 'border-rose-500/80 bg-rose-500/10'
                        : isSelected
                        ? 'bg-[#0df2c9]/10 border-[#0df2c9]/50 shadow-sm shadow-[#0df2c9]/10'
                        : 'bg-[#111927] border-[#22334d]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setCorrectIndex(idx)}
                      title={`Select ${labelLetter} as correct answer`}
                      className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0df2c9] text-slate-950 font-black shadow-md shadow-[#0df2c9]/30'
                          : 'bg-[#1b273a] text-slate-400 hover:text-white hover:bg-[#25354e]'
                      }`}
                    >
                      {labelLetter}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${labelLetter}...`}
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                    />
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold text-[#0df2c9] px-2 py-0.5 bg-[#0df2c9]/20 rounded-md border border-[#0df2c9]/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Solution & Explanation *
              </label>
              {validationErrors.explanation && (
                <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.explanation}
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => {
                setExplanation(e.target.value);
                if (validationErrors.explanation) setValidationErrors((prev) => ({ ...prev, explanation: null }));
              }}
              placeholder="Explain the step-by-step conceptual derivation to boost question quality..."
              className={`w-full bg-[#111927] border rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all ${
                validationErrors.explanation ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[#22334d] focus:border-[#0df2c9]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Academic Citation / Reference
              </label>
              <input
                type="text"
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="e.g. Campbell Biology 12th Ed, Ch. 13"
                className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Genetics, Mitosis, Bio101"
                className="w-full bg-[#111927] border border-[#22334d] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Quality Inspector */}
        <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#22334d] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0df2c9]" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quality Engine</h4>
              </div>
              <Badge variant={liveScore.overall >= 80 ? 'mint' : liveScore.overall >= 60 ? 'warning' : 'danger'}>
                {liveScore.status}
              </Badge>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-extrabold text-white font-mono">{liveScore.overall}</div>
              <div className="text-xs text-slate-400 font-medium">Quality Score / 100 ({liveScore.grade})</div>
              <div className="w-full bg-[#1b273a] h-2 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-300 ${
                    liveScore.overall >= 80 ? 'bg-[#0df2c9]' : liveScore.overall >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${liveScore.overall}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Originality (20%)</span>
                <span className="font-mono font-bold text-white">{liveScore.breakdown.originality}/20</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Factual Precision (25%)</span>
                <span className="font-mono font-bold text-white">{liveScore.breakdown.factual}/25</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Distinction Ratio (20%)</span>
                <span className="font-mono font-bold text-white">{liveScore.breakdown.distinction}/20</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Difficulty Calib. (20%)</span>
                <span className="font-mono font-bold text-white">{liveScore.breakdown.difficulty}/20</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Academic Citations (15%)</span>
                <span className="font-mono font-bold text-white">{liveScore.breakdown.citations}/15</span>
              </div>
            </div>

            {liveScore.suggestions?.length > 0 && (
              <div className="bg-[#0b101b] p-3 rounded-xl border border-amber-500/20 text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Suggestions to reach 80+:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                  {liveScore.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-[#22334d]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePublish('Live')}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black rounded-xl text-xs hover:shadow-lg hover:shadow-[#0df2c9]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Direct Publish & Earn +30 DP</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handlePublish('Pending Review')}
              className="w-full py-2.5 px-4 bg-[#1b273a] hover:bg-[#25354e] text-slate-200 font-semibold rounded-xl text-xs border border-[#2e4363] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#0df2c9]" />
              <span>Submit for Review</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="w-full py-2 px-4 bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
