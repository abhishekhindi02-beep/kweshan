import React from 'react';
import { 
  Sparkles, CheckCircle2, Clock, BookOpen, 
  Image as ImageIcon, PenTool, Sigma, Award, FileText, 
  ExternalLink, Edit3, X, Shield 
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export default function QuestionDetailModal({ isOpen, onClose, question, onEdit }) {
  if (!isOpen || !question) return null;

  const qualityScore = question.qualityScores?.composite || question.qualityScores?.overall || 90;
  const grade = question.qualityScores?.grade || 'A';
  const statusLower = (question.status || 'Live').toLowerCase();

  const isLive = statusLower === 'live' || statusLower === 'approved';
  const isPending = statusLower === 'pending' || statusLower === 'pending review';

  let statusVariant = 'draft';
  if (isLive) statusVariant = 'live';
  else if (isPending) statusVariant = 'pending';

  const hasImage = Boolean(question.image || question.imageUrl);
  const hasDrawing = Boolean(question.drawing || question.figure);
  const equationsList = Array.isArray(question.equations)
    ? question.equations
    : (question.equation ? [question.equation] : []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question.topic || question.deckName || 'Academic Question Details'}
      subtitle={`Item ID: ${question.id || 'Q-ITEM'} • Author: ${question.authorName || 'Scholar'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 animate-fadeIn">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#111927] border border-[#22334d] rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant}>
              {isLive ? 'LIVE IN ARENAS' : isPending ? 'PENDING REVIEW' : 'DRAFT'}
            </Badge>
            <Badge variant={question.type === 'long-form' || !question.options || question.options.length === 0 ? 'purple' : 'mint'}>
              {question.type === 'long-form' || !question.options || question.options.length === 0 ? 'LONG-FORM WRITTEN' : 'MULTIPLE CHOICE'}
            </Badge>
            <Badge variant="purple">{question.deckName || question.category || 'General Academic'}</Badge>
            <Badge variant={question.difficulty === 'Hard' ? 'danger' : question.difficulty === 'Medium' ? 'warning' : 'neutral'}>
              {question.difficulty || 'Medium'}
            </Badge>
          </div>

          {/* Quality Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#090d16] border border-[#1f2d47] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Quality</span>
            <span className="font-extrabold text-[#0df2c9] font-mono">{qualityScore}</span>
            <span className="text-[10px] font-bold text-[#8b5cf6]">({grade})</span>
          </div>
        </div>

        {/* 1. Long-Form Question Prompt */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#0df2c9]" />
            Problem Statement / Question Prompt
          </h4>
          <div className="p-5 bg-[#0b101b] border border-[#22334d] rounded-2xl text-sm sm:text-base text-white leading-relaxed font-medium shadow-inner whitespace-pre-line">
            {question.prompt || question.text}
          </div>
        </div>

        {/* 2. Attachments Section (Images, Drawings, Equations) */}
        {(hasImage || hasDrawing || equationsList.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              Attached Academic Artifacts & Figures
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Attached Image */}
              {hasImage && (
                <div className="p-3 bg-[#111927] border border-[#22334d] rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0df2c9]" />
                    <span>Uploaded Figure</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#1b273a] max-h-56 bg-[#090d16] flex items-center justify-center">
                    <img
                      src={question.image || question.imageUrl}
                      alt="Question Figure"
                      className="w-full h-auto max-h-56 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Attached Hand-Drawn Diagram */}
              {hasDrawing && (
                <div className="p-3 bg-[#111927] border border-[#22334d] rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <PenTool className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Hand-Drawn Diagram</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#1b273a] max-h-56 bg-[#090d16] flex items-center justify-center p-2">
                    <img
                      src={question.drawing || question.figure}
                      alt="Scientific Diagram"
                      className="w-full h-auto max-h-56 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Attached Equations */}
            {equationsList.length > 0 && (
              <div className="p-4 bg-[#111927] border border-[#22334d] rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Sigma className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mathematical & Scientific Formulations</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {equationsList.map((eq, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 rounded-xl bg-[#090d16] border border-[#0df2c9]/30 text-[#0df2c9] font-mono text-sm tracking-wide shadow-sm"
                    >
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Solution / Proof / Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Canonical Solution, Derivation & Proof
          </h4>
          <div className="p-5 bg-[#0b101b] border border-[#22334d] rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
            {question.explanation || 'Detailed academic derivation proof.'}
          </div>
        </div>

        {/* 4. Academic Citation & Reference */}
        {(question.citation || question.citations) && (
          <div className="p-3.5 bg-[#111927] border border-[#22334d] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <BookOpen className="w-4 h-4 text-[#8b5cf6] flex-shrink-0" />
              <span className="font-semibold text-slate-400">Reference:</span>
              <span className="font-mono text-slate-200">{question.citation || question.citations}</span>
            </div>
            <span className="text-[10px] font-mono text-[#0df2c9] uppercase font-bold">Peer Verified</span>
          </div>
        )}

        {/* Footer Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1b273a]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#111927] hover:bg-[#1a233a] border border-[#22334d] text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(question);
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Question
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
