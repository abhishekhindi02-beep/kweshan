import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Edit2, Trash2, ArrowRight, Layers, FileText } from 'lucide-react';

export default function SubjectCard({
  subject,
  questionCount = 0,
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

  return (
    <div className="group relative bg-[#0f1626] hover:bg-[#121b2f] border border-[#1b273f] hover:border-[#0df2c9]/40 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-[#0df2c9]/5 flex flex-col justify-between">
      <div>
        {/* Top bar: Question count badge & actions */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16233b] border border-[#233558] text-[#0df2c9] text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>{questionCount} {questionCount === 1 ? 'Question' : 'Questions'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(subject);
              }}
              title="Edit Subject"
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1a2640] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subject);
              }}
              title="Delete Subject"
              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subject Title */}
        <h3 
          onClick={() => navigate(/subjects/)}
          className="text-lg sm:text-xl font-bold text-white group-hover:text-[#0df2c9] transition-colors cursor-pointer mb-2 line-clamp-1"
        >
          {subject.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#94a3b8] line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {subject.description || 'No description provided for this academic subject.'}
        </p>
      </div>

      <div>
        {/* Dates metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#64748b] pt-3 border-t border-[#182338] mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(subject.createdAt)}</span>
          </div>
          {subject.updatedAt && subject.updatedAt !== subject.createdAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDate(subject.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => navigate(/subjects/)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#152037] hover:bg-[#0df2c9] text-[#cbd5e1] hover:text-slate-950 font-semibold text-xs sm:text-sm border border-[#223252] hover:border-[#0df2c9] transition-all duration-150 cursor-pointer"
        >
          <span>Open Subject</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
