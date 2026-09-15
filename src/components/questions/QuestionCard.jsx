import React from 'react';
import { 
  Edit3, Trash2, CheckCircle, Send, 
  Image as ImageIcon, PenTool, Sigma, Eye, Calendar 
} from 'lucide-react';
import Badge from '../common/Badge';

export default function QuestionCard({ 
  question, 
  onEdit, 
  onViewDetails,
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

  const handleApproveClick = () => {
    if (onDemoApprove) {
      onDemoApprove(question.id);
    } else if (onApprove) {
      onApprove(question.id);
    }
  };

  const hasImage = Boolean(question.image || question.imageUrl);
  const hasDrawing = Boolean(question.drawing || question.figure);
  const hasEquations = Boolean(
    (Array.isArray(question.equations) && question.equations.length > 0) ||
    question.equation
  );

  const formattedDate = question.createdAt 
    ? new Date(question.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent';

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
            <Badge variant={question.type === 'long-form' || !question.options || question.options.length === 0 ? 'purple' : 'mint'} size="xs">
              {question.type === 'long-form' || !question.options || question.options.length === 0 ? 'LONG-FORM' : 'MCQ'}
            </Badge>
            <Badge variant={question.difficulty === 'Hard' ? 'danger' : question.difficulty === 'Medium' ? 'warning' : 'neutral'} size="xs">
              {question.difficulty || 'Medium'}
            </Badge>
          </div>

          {/* Quality Score Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#090d16] border border-[#1f2d47]">
            <span className="text-[10px] font-mono text-[#64748b] uppercase">Quality</span>
            <span className="text-xs font-extrabold text-[#0df2c9] font-mono">{qualityScore}</span>
            <span className="text-[10px] font-bold text-[#8b5cf6]">({grade})</span>
          </div>
        </div>

        {/* Topic and Long-Form Question Text */}
        <div className="my-2 space-y-1.5 cursor-pointer" onClick={() => onViewDetails && onViewDetails(question)}>
          <div className="text-xs font-mono text-[#8b5cf6] uppercase tracking-wider font-semibold truncate flex items-center justify-between">
            <span>{question.topic || question.deckName || 'Academic Concept'}</span>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white font-medium leading-relaxed line-clamp-3 group-hover:text-[#0df2c9] transition-colors">
            {question.prompt || question.text}
          </p>
        </div>

        {/* Attachment Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {hasImage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0df2c9]/10 text-[#0df2c9] text-[10px] font-mono font-bold border border-[#0df2c9]/20">
              <ImageIcon className="w-3 h-3" />
              Image
            </span>
          )}
          {hasDrawing && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#38bdf8]/10 text-[#38bdf8] text-[10px] font-mono font-bold border border-[#38bdf8]/20">
              <PenTool className="w-3 h-3" />
              Figure
            </span>
          )}
          {hasEquations && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-400/20">
              <Sigma className="w-3 h-3" />
              Equation
            </span>
          )}
          {(question.citation || question.citations) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-mono border border-purple-500/20">
              Citation
            </span>
          )}
        </div>
      </div>

      {/* Footer Metrics and Actions */}
      <div className="pt-3 mt-3 border-t border-[#18233a] flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails && onViewDetails(question)}
          className="px-2.5 py-1 rounded-lg text-[#0df2c9] hover:bg-[#0df2c9]/10 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>

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
