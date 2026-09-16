import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Image as ImageIcon, PenTool, Sigma, 
  Calendar, Clock, Edit2, Trash2, ArrowRight, BookOpen, Tag
} from 'lucide-react';

export default function QuestionCard({
  question,
  showSubjectBadge = true,
  onEdit,
  onDelete
}) {
  const navigate = useNavigate();

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const imagesCount = question.attachments?.images?.length || 0;
  const drawingsCount = question.attachments?.drawings?.length || 0;
  const equationsCount = question.attachments?.equations?.length || 0;
  const totalAttachments = imagesCount + drawingsCount + equationsCount;

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    hard: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  const diffKey = (question.difficulty || 'Medium').toLowerCase();
  const diffClass = difficultyColors[diffKey] || difficultyColors.medium;

  const questionUrl = `/subjects/${question.subjectId}/questions/${question.id}`;

  return (
    <div className="group relative bg-[#0f1626] hover:bg-[#121b2f] border border-[#1b273f] hover:border-[#0df2c9]/40 rounded-2xl p-5 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#0df2c9]/5 flex flex-col justify-between">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {showSubjectBadge && question.subjectName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#16233b] border border-[#233558] text-[#0df2c9] text-[11px] font-semibold">
                <BookOpen className="w-3 h-3" />
                <span>{question.subjectName}</span>
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${diffClass}`}>
              {question.difficulty || 'Medium'}
            </span>
            {question.topic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#131b2e] border border-[#1e2c47] text-[#94a3b8] text-[11px] line-clamp-1 max-w-[150px]">
                <Tag className="w-2.5 h-2.5" />
                <span className="truncate">{question.topic}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(question);
                else navigate(`/subjects/${question.subjectId}/questions/${question.id}/edit`);
              }}
              title="Edit Question"
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1a2640] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(question);
              }}
              title="Delete Question"
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <h4 
          onClick={() => navigate(questionUrl)}
          className="text-sm sm:text-base font-semibold text-white group-hover:text-[#0df2c9] transition-colors cursor-pointer line-clamp-3 leading-relaxed mb-3"
        >
          {question.questionText}
        </h4>

        {/* Attachments indicators */}
        {totalAttachments > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {imagesCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#162035] text-[#38bdf8] text-[11px] font-medium border border-[#233250]">
                <ImageIcon className="w-3 h-3" />
                <span>{imagesCount} {imagesCount === 1 ? 'Image' : 'Images'}</span>
              </span>
            )}
            {drawingsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#162035] text-[#a855f7] text-[11px] font-medium border border-[#233250]">
                <PenTool className="w-3 h-3" />
                <span>{drawingsCount} {drawingsCount === 1 ? 'Figure' : 'Figures'}</span>
              </span>
            )}
            {equationsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#162035] text-[#fbbf24] text-[11px] font-medium border border-[#233250]">
                <Sigma className="w-3 h-3" />
                <span>{equationsCount} {equationsCount === 1 ? 'Equation' : 'Equations'}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Dates metadata & Open button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#182338] text-[11px] text-[#64748b]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(question.createdAt)}</span>
            </span>
          </div>

          <button
            onClick={() => navigate(questionUrl)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0df2c9] group-hover:underline cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
