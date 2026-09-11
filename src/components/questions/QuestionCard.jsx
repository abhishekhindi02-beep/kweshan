import React from 'react';
import { Edit3, BarChart2, Trash2, CheckCircle, Send, BookOpen } from 'lucide-react';
import Badge from '../common/Badge';

export default function QuestionCard({ 
  question, 
  onEdit, 
  onAnalytics, 
  onViewAnalytics, 
  onDelete, 
  onSubmitReview, 
  onDemoApprove,
  onApprove,
  onReject
}) {
  const statusLower = (question.status || '').toLowerCase();
  const isDraft = statusLower === 'draft';
  const isPending = statusLower === 'pending' || statusLower === 'pending review';
  const isLive = statusLower === 'live' || statusLower === 'approved';

  const qualityScore = question.qualityScores?.composite || question.qualityScores?.overall || 88;
  const grade = question.qualityScores?.grade || 'A-';

  let statusVariant = 'draft';
  if (isLive) statusVariant = 'live';
  else if (isPending) statusVariant = 'pending';

  const handleAnalyticsClick = () => {
    if (onAnalytics) {
      onAnalytics(question);
    } else if (onViewAnalytics) {
      onViewAnalytics(question);
    }
  };

  const handleApproveClick = () => {
    if (onDemoApprove) {
      onDemoApprove(question.id);
    } else if (onApprove) {
      onApprove(question.id);
    }
  };

  const playsCount = question.plays ?? question.totalAttempts ?? 0;
  const accuracyPct = question.accuracy ?? (playsCount > 0 ? Math.round(((question.correctAttempts || 0) / playsCount) * 100) : 0);

  return (
    <div className="bg-[#101726] border border-[#1c273e] hover:border-[#2a3b5c] rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div>
        {/* Header with ID, Status, and Quality Score */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#64748b] bg-[#090d16] px-2.5 py-1 rounded-lg border border-[#18233a]">
              {question.id}
            </span>
            <Badge variant={statusVariant} size="xs">
              {isLive ? 'LIVE' : isPending ? 'PENDING REVIEW' : 'DRAFT'}
            </Badge>
          </div>

          {/* Quality Score Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#090d16] border border-[#1f2d47]">
            <span className="text-[10px] font-mono text-[#64748b] uppercase">Quality</span>
            <span className="text-xs font-extrabold text-[#0df2c9] font-mono">{qualityScore}</span>
            <span className="text-[10px] font-bold text-[#8b5cf6]">({grade})</span>
          </div>
        </div>

        {/* Topic and Text */}
        <div className="my-2 space-y-1">
          <div className="text-xs font-mono text-[#8b5cf6] uppercase tracking-wider font-semibold truncate">
            {question.topic || question.deckName || 'Academic Concept'}
          </div>
          <p className="text-xs sm:text-sm text-white font-medium leading-relaxed line-clamp-2">
            {question.prompt || question.text}
          </p>
        </div>
      </div>

      {/* Footer Metrics and Actions */}
      <div className="pt-3 mt-3 border-t border-[#18233a] flex flex-wrap items-center justify-between gap-3">
        {/* Plays & Accuracy */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#64748b]">
          <div>
            <span className="text-white font-bold">{playsCount}</span> plays
          </div>
          <div>
            <span className="text-[#0df2c9] font-bold">{accuracyPct}%</span> accuracy
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {isDraft && onSubmitReview && (
            <button
              onClick={() => onSubmitReview(question.id)}
              className="px-2.5 py-1 rounded-lg bg-[#f59e0b]/15 text-[#fbbf24] hover:bg-[#f59e0b]/25 text-xs font-bold transition-colors flex items-center gap-1 border border-[#f59e0b]/30 cursor-pointer"
              title="Submit for peer review"
            >
              <Send className="w-3 h-3" />
              <span>Submit</span>
            </button>
          )}

          {isPending && (
            <button
              onClick={handleApproveClick}
              className="px-2.5 py-1 rounded-lg bg-[#00f59b]/15 text-[#00f59b] hover:bg-[#00f59b]/25 text-xs font-bold transition-colors flex items-center gap-1 border border-[#00f59b]/30 cursor-pointer"
              title="Approve to Live"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Approve</span>
            </button>
          )}

          <button
            onClick={handleAnalyticsClick}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0df2c9] hover:bg-[#1a233a] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="View detailed performance analytics"
          >
            <BarChart2 className="w-4 h-4 text-[#0df2c9]" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => onEdit(question)}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0df2c9] hover:bg-[#1a233a] transition-colors cursor-pointer"
            title="Edit question"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#ef4444] hover:bg-[#1a233a] transition-colors cursor-pointer"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
