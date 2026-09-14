import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, 
  Trophy, Sparkles, Check, HelpCircle, Flame, Image as ImageIcon, 
  PenTool, Sigma, FileText, Eye, AlertCircle, Award
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';
import { evaluateWrittenAnswer } from '../../services/answerEvaluator';
import confetti from 'canvas-confetti';

export default function DeckPracticeModal({ isOpen, onClose, deck }) {
  const { questions, completePracticeDeck, recordQuestionAttempt } = useGame();

  const [deckQuestions, setDeckQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLongFormCorrect, setIsLongFormCorrect] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [reattemptedQuestions, setReattemptedQuestions] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);

  const initializedDeckIdRef = useRef(null);

  useEffect(() => {
    if (isOpen && deck) {
      if (initializedDeckIdRef.current === deck.id) {
        return;
      }
      initializedDeckIdRef.current = deck.id;

      // Find questions strictly for this deck
      let list = questions.filter((q) => q.deckId === deck.id);
      if (list.length === 0) {
        // Fallback by category or top questions
        list = questions.filter((q) => q.category === deck.category);
        if (list.length === 0) list = questions.slice(0, 5);
      }
      setDeckQuestions(list.slice(0, 5));
      setCurrentIndex(0);
      setSelectedOption(null);
      setWrittenAnswer('');
      setIsAnswered(false);
      setIsLongFormCorrect(null);
      setEvaluationResult(null);
      setCorrectCount(0);
      setReattemptedQuestions(new Set());
      setIsFinished(false);
    } else if (!isOpen) {
      initializedDeckIdRef.current = null;
    }
  }, [isOpen, deck?.id, questions]);

  if (!isOpen || !deck || deckQuestions.length === 0) return null;

  const currentQ = deckQuestions[currentIndex] || deckQuestions[0];
  const total = deckQuestions.length;

  const isLongForm = !currentQ.options || currentQ.options.length === 0;

  // Resolve the correct index reliably for MCQ
  const correctIdx = typeof currentQ.correctAnswerIndex === 'number' 
    ? currentQ.correctAnswerIndex 
    : (typeof currentQ.correctIndex === 'number' 
      ? currentQ.correctIndex 
      : (currentQ.options?.findIndex(o => o.isCorrect) ?? 0));

  const isCurrentSelectionCorrect = isLongForm 
    ? isLongFormCorrect === true
    : selectedOption === correctIdx;

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (isAnswered) return;

    if (isLongForm) {
      setIsAnswered(true);
      // Run intelligent academic grading evaluation on the user's written response
      const evalResult = evaluateWrittenAnswer(writtenAnswer, currentQ);
      setEvaluationResult(evalResult);

      const passes = evalResult.isCorrect;
      setIsLongFormCorrect(passes);

      if (passes && !reattemptedQuestions.has(currentIndex)) {
        setCorrectCount((prev) => prev + 1);
      }

      if (recordQuestionAttempt && currentQ?.id) {
        recordQuestionAttempt(currentQ.id, writtenAnswer, passes, 4000);
      }
    } else {
      if (selectedOption === null) return;
      setIsAnswered(true);
      const isCorrect = selectedOption === correctIdx;
      
      if (isCorrect && !reattemptedQuestions.has(currentIndex)) {
        setCorrectCount((prev) => prev + 1);
      }

      if (recordQuestionAttempt && currentQ?.id) {
        recordQuestionAttempt(currentQ.id, selectedOption, isCorrect, 3500);
      }
    }
  };

  const handleMarkLongFormResult = (isCorrect) => {
    if (isLongFormCorrect === isCorrect) return;
    setIsLongFormCorrect(isCorrect);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else if (correctCount > 0) {
      setCorrectCount((prev) => prev - 1);
    }
  };

  const handleReattempt = () => {
    setReattemptedQuestions((prev) => new Set(prev).add(currentIndex));
    setSelectedOption(null);
    setWrittenAnswer('');
    setIsAnswered(false);
    setIsLongFormCorrect(null);
    setEvaluationResult(null);
  };

  const handleNext = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setWrittenAnswer('');
      setIsAnswered(false);
      setIsLongFormCorrect(null);
      setEvaluationResult(null);
    } else {
      setIsFinished(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      completePracticeDeck(deck.id, correctCount, total);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setWrittenAnswer('');
    setIsAnswered(false);
    setIsLongFormCorrect(null);
    setCorrectCount(0);
    setReattemptedQuestions(new Set());
    setIsFinished(false);
  };

  const hasImage = Boolean(currentQ.image || currentQ.imageUrl);
  const hasDrawing = Boolean(currentQ.drawing || currentQ.figure);
  const equationsList = Array.isArray(currentQ.equations)
    ? currentQ.equations
    : (currentQ.equation ? [currentQ.equation] : []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFinished ? 'Practice Session Summary' : `Practice: ${deck.title}`}
      maxWidth="max-w-2xl"
    >
      {!isFinished ? (
        <div className="space-y-6">
          {/* Header Progress Bar & Question Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">
                Question <span className="text-white font-bold">{currentIndex + 1}</span> of {total}
                {isLongForm && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#a855f7] font-bold text-[10px] uppercase">
                    Long-Form Written
                  </span>
                )}
              </span>
              <span className="font-mono text-[#0df2c9] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                Score: {correctCount * 10} DP
              </span>
            </div>
            <ProgressBar
              value={((currentIndex + (isAnswered ? 1 : 0)) / total) * 100}
              color="mint"
              size="sm"
              showPercentage={false}
            />
          </div>

          {/* Question Prompt Card */}
          <div className="bg-[#111927] border border-[#22334d] p-5 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <Badge variant="purple">{currentQ.deckName || deck.title}</Badge>
              <Badge variant={currentQ.difficulty === 'hard' || currentQ.difficulty === 'Hard' ? 'danger' : 'warning'}>
                {currentQ.difficulty ? (currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)) : 'Medium'}
              </Badge>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed whitespace-pre-line">
              {currentQ.prompt || currentQ.text}
            </p>

            {/* Attached Visual Artifacts if any */}
            {(hasImage || hasDrawing || equationsList.length > 0) && (
              <div className="pt-3 border-t border-[#1b273a] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hasImage && (
                    <div className="rounded-xl overflow-hidden border border-[#22334d] bg-[#090d16] p-1 flex items-center justify-center max-h-48">
                      <img src={currentQ.image || currentQ.imageUrl} alt="Problem Figure" className="w-full h-auto max-h-48 object-contain rounded-lg" />
                    </div>
                  )}
                  {hasDrawing && (
                    <div className="rounded-xl overflow-hidden border border-[#22334d] bg-[#090d16] p-1 flex items-center justify-center max-h-48">
                      <img src={currentQ.drawing || currentQ.figure} alt="Scientific Diagram" className="w-full h-auto max-h-48 object-contain rounded-lg" />
                    </div>
                  )}
                </div>

                {equationsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {equationsList.map((eq, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-[#090d16] border border-[#0df2c9]/30 text-[#0df2c9] text-xs font-mono">
                        {eq}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Answering Area: Long-Form Written vs Multiple Choice */}
          {isLongForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Your Written Derivation / Solution:
                </label>
                {!isAnswered && (
                  <span className="text-[11px] text-[#0df2c9] font-medium flex items-center gap-1">
                    💡 Requires key formulas & steps for +10 DP
                  </span>
                )}
              </div>

              {/* Quick Math Notation Bar */}
              {!isAnswered && (
                <div className="p-2.5 rounded-xl bg-[#090d16] border border-[#22334d] flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Insert Symbols:</span>
                  {[
                    { label: 'ΣFx', insert: 'ΣFx = m·ax' },
                    { label: 'ΣFy', insert: 'ΣFy = m·ay' },
                    { label: 'F=ma', insert: 'F = m·a' },
                    { label: 'a=√(ax²+ay²)', insert: 'a = √((ΣFx/m)² + (ΣFy/m)²)' },
                    { label: 'θ', insert: 'θ' },
                    { label: '√', insert: '√' },
                    { label: 'Σ', insert: 'Σ' },
                    { label: '²', insert: '²' }
                  ].map((sym, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWrittenAnswer((prev) => (prev ? prev + ' ' + sym.insert : sym.insert))}
                      className="px-2 py-1 rounded bg-[#111927] hover:bg-[#1b273a] border border-[#22334d] hover:border-[#0df2c9]/50 text-slate-300 hover:text-[#0df2c9] font-mono text-[11px] transition-all cursor-pointer"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                rows={3}
                disabled={isAnswered}
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Explain the physical principle, resolve Cartesian components (ΣFx, ΣFy), and derive the net acceleration..."
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors leading-relaxed disabled:opacity-80"
              />
            </div>
          ) : (
            /* Multiple Choice Options */
            <div className="space-y-2.5">
              {currentQ.options?.map((option, idx) => {
                const optionText = typeof option === 'string' ? option : option.text;
                const letter = String.fromCharCode(65 + idx);
                const isSelected = selectedOption === idx;
                const isOptionCorrect = idx === correctIdx;

                let btnStyle = 'bg-[#111927] border-[#22334d] hover:border-[#0df2c9]/50 text-slate-200';
                if (isAnswered) {
                  if (isOptionCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm shadow-emerald-500/20';
                  } else if (isSelected && !isOptionCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold shadow-sm shadow-rose-500/20';
                  } else {
                    btnStyle = 'bg-[#111927]/60 border-[#22334d] text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-[#0df2c9]/15 border-[#0df2c9] text-[#0df2c9] font-bold shadow-sm shadow-[#0df2c9]/20';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          isAnswered && isOptionCorrect
                            ? 'bg-emerald-400 text-slate-950 font-black'
                            : isAnswered && isSelected && !isOptionCorrect
                            ? 'bg-rose-400 text-slate-950 font-black'
                            : isSelected
                            ? 'bg-[#0df2c9] text-slate-950 font-black'
                            : 'bg-[#1b273a] text-slate-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 leading-snug">{optionText}</span>
                    </div>

                    {isAnswered && isOptionCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                    {isAnswered && isSelected && !isOptionCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Academic Evaluation Verdict & Canonical Derivation once answered */}
          {isAnswered && (
            <div className="space-y-3 animate-fadeIn">
              {/* Intelligent Grading Card for Long-Form */}
              {isLongForm && evaluationResult && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isLongFormCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isLongFormCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <span
                          className={`text-sm font-black uppercase tracking-wider block ${
                            isLongFormCorrect ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isLongFormCorrect ? '✅ CORRECT ANSWER (+10 DP AWARDED)' : '❌ WRONG ANSWER (0 DP AWARDED)'}
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {evaluationResult.feedback}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Concept breakdown tags */}
                  <div className="mt-3 pt-3 border-t border-slate-700/40 space-y-2">
                    {evaluationResult.matchedConcepts?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-emerald-400 mr-1">Matched Concepts:</span>
                        {evaluationResult.matchedConcepts.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold"
                          >
                            ✓ {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {!isLongFormCorrect && evaluationResult.missingConcepts?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-rose-400 mr-1">Missing Required Components:</span>
                        {evaluationResult.missingConcepts.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px]"
                          >
                            ✗ {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Canonical Correct Answer & Derivation Card */}
              <div className="p-4 rounded-2xl border space-y-3 bg-[#0d1627] border-[#0df2c9]/40">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#0df2c9] flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    {!isLongFormCorrect && isLongForm
                      ? '📖 Complete Correct Answer & Derivation Steps'
                      : 'Canonical Solution & Derivation Proof'}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 bg-[#111927] px-2 py-0.5 rounded-full border border-[#22334d]">
                    Academic Standard
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {currentQ.explanation || 'According to standard academic principles, the governing formulation holds as derived.'}
                </p>

                {(currentQ.citation || currentQ.citations) && (
                  <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-700/40">
                    Reference: {currentQ.citation || currentQ.citations}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons: Submit / Reattempt / Next */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              {isAnswered && !isCurrentSelectionCorrect && (
                <button
                  onClick={handleReattempt}
                  className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reattempt Question
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isAnswered ? (
                <button
                  disabled={!isLongForm && selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
                >
                  {isLongForm ? 'Submit & Reveal Solution' : 'Submit Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {currentIndex + 1 < total ? 'Next Question' : 'Finish Practice'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="space-y-6 text-center py-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0df2c9]/20 border border-[#0df2c9]/40 flex items-center justify-center text-[#0df2c9]">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Deck Practice Completed!</h3>
            <p className="text-xs text-slate-400">
              You reviewed {total} questions in <span className="text-[#0df2c9] font-medium">{deck.title}</span>.
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl">
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{correctCount}/{total}</div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl">
              <div className="text-xs text-slate-400">Accuracy</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {Math.round((correctCount / total) * 100)}%
              </div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl">
              <div className="text-xs text-slate-400">DP Earned</div>
              <div className="text-xl font-bold font-mono text-[#0df2c9] mt-0.5">
                +{correctCount * 10} DP
              </div>
            </div>
          </div>

          {/* Mastery Progress Gain */}
          <div className="bg-[#0b101b] border border-[#22334d] p-4 rounded-xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Deck Mastery Increased</span>
              <span className="text-[#0df2c9] font-mono font-bold">
                +{Math.round((correctCount / total) * 10)}%
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, (deck.mastery || deck.progress || 50) + Math.round((correctCount / total) * 10))}
              color="mint"
              size="sm"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#1b273a]">
            <button
              onClick={handleRestart}
              className="px-4 py-2.5 bg-[#1b273a] hover:bg-[#25354e] text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Practice Again
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0df2c9] text-slate-950 font-black text-xs rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
