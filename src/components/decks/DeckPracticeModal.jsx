import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, 
  Trophy, Sparkles, Check, HelpCircle, Flame, Image as ImageIcon, 
  PenTool, Sigma, FileText, Eye, AlertCircle, Award, ListChecks, Edit3
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';
import { evaluateWrittenAnswer } from '../../services/answerEvaluator';
import confetti from 'canvas-confetti';

export default function DeckPracticeModal({ isOpen, onClose, deck }) {
  const { getPracticeQuestions, completePracticeDeck, recordQuestionAttempt } = useGame();

  const [deckQuestions, setDeckQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Scoring & Stats Tracking
  const [sessionResults, setSessionResults] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const initializedDeckIdRef = useRef(null);

  // Initialize practice session with strictly UNIQUE questions
  useEffect(() => {
    if (isOpen && deck) {
      if (initializedDeckIdRef.current === deck.id) {
        return;
      }
      initializedDeckIdRef.current = deck.id;

      // Get up to 5 strictly unique questions
      let uniqueList = [];
      if (getPracticeQuestions) {
        uniqueList = getPracticeQuestions(deck.id, 5);
      }

      setDeckQuestions(uniqueList);
      setCurrentIndex(0);
      setSelectedOption(null);
      setWrittenAnswer('');
      setIsAnswered(false);
      setEvaluationResult(null);
      setSessionResults([]);
      setIsFinished(false);
    } else if (!isOpen) {
      initializedDeckIdRef.current = null;
    }
  }, [isOpen, deck?.id, getPracticeQuestions]);

  if (!isOpen || !deck || deckQuestions.length === 0) return null;

  const currentQ = deckQuestions[currentIndex] || deckQuestions[0];
  const total = deckQuestions.length;

  const isLongForm = currentQ.type === 'long-form' || !currentQ.options || currentQ.options.length === 0;

  // Resolve MCQ correct index
  const correctIdx = typeof currentQ.correctAnswerIndex === 'number' 
    ? currentQ.correctAnswerIndex 
    : (typeof currentQ.correctIndex === 'number' 
      ? currentQ.correctIndex 
      : (currentQ.options?.findIndex(o => o.isCorrect) ?? 0));

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (isAnswered) return;

    if (isLongForm) {
      setIsAnswered(true);
      // Run strict rubric evaluation
      const evalResult = evaluateWrittenAnswer(writtenAnswer, currentQ);
      setEvaluationResult(evalResult);

      const resultEntry = {
        questionId: currentQ.id,
        type: 'long-form',
        isCorrect: evalResult.isCorrect,
        isPartial: evalResult.isPartial,
        awardedDP: evalResult.awardedDP,
        scorePercent: evalResult.scorePercent,
        userAnswer: writtenAnswer
      };

      setSessionResults((prev) => [...prev, resultEntry]);

      if (recordQuestionAttempt && currentQ?.id) {
        recordQuestionAttempt(currentQ.id, writtenAnswer, evalResult.isCorrect, 4000);
      }
    } else {
      if (selectedOption === null) return;
      setIsAnswered(true);
      const isCorrect = selectedOption === correctIdx;
      const awardedDP = isCorrect ? 10 : 0;

      const resultEntry = {
        questionId: currentQ.id,
        type: 'mcq',
        isCorrect,
        isPartial: false,
        awardedDP,
        scorePercent: isCorrect ? 100 : 0,
        selectedOption
      };

      setSessionResults((prev) => [...prev, resultEntry]);

      if (recordQuestionAttempt && currentQ?.id) {
        recordQuestionAttempt(currentQ.id, selectedOption, isCorrect, 3500);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setWrittenAnswer('');
      setIsAnswered(false);
      setEvaluationResult(null);
    } else {
      setIsFinished(true);
      
      const totalEarnedDP = sessionResults.reduce((acc, r) => acc + (r.awardedDP || 0), 0) + (isLongForm ? (evaluationResult?.awardedDP || 0) : (selectedOption === correctIdx ? 10 : 0));
      const totalCorrect = sessionResults.filter(r => r.isCorrect).length + (isLongForm ? (evaluationResult?.isCorrect ? 1 : 0) : (selectedOption === correctIdx ? 1 : 0));

      if (totalCorrect >= Math.ceil(total / 2)) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }

      if (completePracticeDeck) {
        completePracticeDeck(deck.id, totalCorrect, total);
      }
    }
  };

  const handleRestart = () => {
    // Re-fetch a fresh unique set of questions for this session
    let freshQuestions = [];
    if (getPracticeQuestions) {
      freshQuestions = getPracticeQuestions(deck.id, 5);
    } else {
      freshQuestions = deckQuestions;
    }
    setDeckQuestions(freshQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setWrittenAnswer('');
    setIsAnswered(false);
    setEvaluationResult(null);
    setSessionResults([]);
    setIsFinished(false);
  };

  // Stats calculation for active session & summary
  const currentTotalDP = sessionResults.reduce((sum, r) => sum + (r.awardedDP || 0), 0);
  const correctCount = sessionResults.filter(r => r.isCorrect).length;
  const partialCount = sessionResults.filter(r => r.isPartial).length;
  const incorrectCount = sessionResults.filter(r => !r.isCorrect && !r.isPartial).length;
  const mcqCount = deckQuestions.filter(q => q.type === 'mcq' || (q.options && q.options.length > 0)).length;
  const longFormCount = deckQuestions.filter(q => q.type === 'long-form' || !q.options || q.options.length === 0).length;

  const hasImage = Boolean(currentQ.image || currentQ.imageUrl || (currentQ.attachments?.images && currentQ.attachments.images.length > 0));
  const hasDrawing = Boolean(currentQ.drawing || currentQ.figure || (currentQ.attachments?.drawings && currentQ.attachments.drawings.length > 0));
  const equationsList = Array.isArray(currentQ.equations)
    ? currentQ.equations
    : (currentQ.attachments?.equations || (currentQ.equation ? [currentQ.equation] : []));

  const imageUrl = currentQ.image || currentQ.imageUrl || currentQ.attachments?.images?.[0];
  const drawingUrl = currentQ.drawing || currentQ.figure || currentQ.attachments?.drawings?.[0];

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
              <div className="flex items-center gap-2">
                <span className="font-mono">
                  Question <span className="text-white font-bold">{currentIndex + 1}</span> of {total}
                  {total < 5 && (
                    <span className="text-slate-500 text-[11px] ml-1">
                      ({total} unique questions available)
                    </span>
                  )}
                </span>
                {/* PROMINENT QUESTION TYPE BADGE */}
                {isLongForm ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#a855f7] font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    LONG-FORM WRITTEN
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                    <ListChecks className="w-3 h-3" />
                    MULTIPLE CHOICE
                  </span>
                )}
              </div>

              <span className="font-mono text-[#0df2c9] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                Session: {currentTotalDP} DP
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

            {/* Attached Visual Artifacts (Images, Hand-drawn diagrams, Equations) */}
            {(hasImage || hasDrawing || equationsList.length > 0) && (
              <div className="pt-3 border-t border-[#1b273a] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hasImage && imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-[#22334d] bg-[#090d16] p-1 flex items-center justify-center max-h-48">
                      <img src={imageUrl} alt="Problem Figure" className="w-full h-auto max-h-48 object-contain rounded-lg" />
                    </div>
                  )}
                  {hasDrawing && drawingUrl && (
                    <div className="rounded-xl overflow-hidden border border-[#22334d] bg-[#090d16] p-1 flex items-center justify-center max-h-48">
                      <img src={drawingUrl} alt="Scientific Diagram" className="w-full h-auto max-h-48 object-contain rounded-lg" />
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

          {/* Answering Area: Distinct UI for Long-Form vs MCQ */}
          {isLongForm ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Your Written Derivation / Solution:
                </label>
                {!isAnswered && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Evaluated using the required concept/formula rubric (80%+ for +10 DP)
                  </span>
                )}
              </div>

              {/* Quick Math Symbols Helper */}
              {!isAnswered && (
                <div className="p-2.5 rounded-xl bg-[#090d16] border border-[#22334d] flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Insert Symbols:</span>
                  {[
                    { label: 'ΣFx = m·ax', insert: 'ΣFx = m·ax' },
                    { label: 'ΣFy = m·ay', insert: 'ΣFy = m·ay' },
                    { label: 'F = m·a', insert: 'F = m·a' },
                    { label: 'a = √(ax² + ay²)', insert: 'a = √((ΣFx/m)² + (ΣFy/m)²)' },
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
                rows={4}
                disabled={isAnswered}
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="State the core physical laws, resolve Cartesian components (ΣFx, ΣFy), and derive the resultant acceleration..."
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors leading-relaxed disabled:opacity-80"
              />
            </div>
          ) : (
            /* Multiple Choice Options (A, B, C, D) */
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Select One Correct Option:
              </label>
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
              {/* Long-Form Rubric Evaluation Card */}
              {isLongForm && evaluationResult && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    evaluationResult.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : evaluationResult.isPartial
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {evaluationResult.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      ) : evaluationResult.isPartial ? (
                        <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <span
                          className={`text-sm font-black uppercase tracking-wider block ${
                            evaluationResult.isCorrect
                              ? 'text-emerald-400'
                              : evaluationResult.isPartial
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {evaluationResult.gradeLabel}
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {evaluationResult.feedback}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-400 block">
                        Rubric Score: {evaluationResult.scorePercent}%
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Threshold: 80%
                      </span>
                    </div>
                  </div>

                  {/* Concept & Formula breakdown */}
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

                    {!evaluationResult.isCorrect && evaluationResult.missingConcepts?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-rose-400 mr-1">Missing Components:</span>
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
                    Canonical Solution & Derivation Proof
                  </div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 bg-[#111927] px-2 py-0.5 rounded-full border border-[#22334d]">
                    Academic Standard
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {currentQ.canonicalSolution || currentQ.explanation || 'According to standard academic principles, the governing formulation holds as derived.'}
                </p>

                {(currentQ.citation || currentQ.citations) && (
                  <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-700/40">
                    Reference: {currentQ.citation || currentQ.citations}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons: Submit / Next */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isAnswered ? (
              <button
                disabled={!isLongForm && selectedOption === null}
                onClick={handleSubmitAnswer}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md"
              >
                Submit Answer
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
      ) : (
        /* Results Screen with Full Session Breakdown */
        <div className="space-y-6 text-center py-4 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0df2c9]/20 border border-[#0df2c9]/40 flex items-center justify-center text-[#0df2c9]">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">Deck Practice Completed!</h3>
            <p className="text-xs text-slate-400">
              Session completed for <span className="text-[#0df2c9] font-medium">{deck.title}</span>.
            </p>
          </div>

          {/* 4 Core Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#111927] border border-[#22334d] p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Questions</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">{total}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{longFormCount} Long • {mcqCount} MCQ</div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Results</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{correctCount} Correct</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{partialCount} Partial • {incorrectCount} Incorrect</div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Accuracy</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {Math.round((correctCount / (total || 1)) * 100)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Rubric Evaluated</div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">DP Earned</div>
              <div className="text-lg font-bold font-mono text-[#0df2c9] mt-0.5">
                +{currentTotalDP} DP
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Mastery +{Math.round((correctCount / (total || 1)) * 10)}%</div>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="bg-[#0b101b] border border-[#22334d] p-4 rounded-xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Deck Mastery Level</span>
              <span className="text-[#0df2c9] font-mono font-bold">
                {Math.min(100, (deck.mastery || deck.progress || 50) + Math.round((correctCount / (total || 1)) * 10))}%
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, (deck.mastery || deck.progress || 50) + Math.round((correctCount / (total || 1)) * 10))}
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

