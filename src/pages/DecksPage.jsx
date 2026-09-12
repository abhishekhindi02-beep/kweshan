import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Search, Play, Award, Sparkles, Filter, ChevronRight } from 'lucide-react';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { useGame } from '../context/GameContext';

export default function DecksPage({ onStartPractice, onStartBattle }) {
  const { decks, startPracticeDeck } = useGame();
  const params = useParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle direct route /practice/:deckId or /decks/:deckId
  useEffect(() => {
    if (params.deckId && decks.length > 0) {
      const found = decks.find((d) => d.id === params.deckId);
      if (found) {
        if (onStartPractice) {
          onStartPractice(found);
        } else {
          startPracticeDeck(found.id);
        }
      }
    }
  }, [params.deckId, decks]);

  const categories = ['all', 'Science', 'Mathematics', 'Computer Science', 'Economics', 'History'];

  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      if (selectedCategory !== 'all' && deck.category !== selectedCategory && deck.subject !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = deck.title?.toLowerCase().includes(q);
        const matchesDesc = deck.description?.toLowerCase().includes(q);
        const matchesSubject = deck.subject?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubject) return false;
      }
      return true;
    });
  }, [decks, selectedCategory, searchQuery]);

  const handlePractice = (deck) => {
    if (onStartPractice) {
      onStartPractice(deck);
    } else {
      startPracticeDeck(deck.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#0df2c9]" />
            Academic Deck Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Master specialized subjects, complete peer-reviewed decks, and earn Distinction Points.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111927] border border-[#22334d] p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#22334d] pb-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0df2c9] text-slate-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b273a]'
              }`}
            >
              {cat === 'all' ? 'All Subjects' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks by topic, course, or keyword..."
            className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
          />
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => (
          <div
            key={deck.id}
            className="bg-[#111927] border border-[#22334d] hover:border-[#0df2c9]/50 rounded-2xl p-5 flex flex-col justify-between group transition-all duration-200 shadow-sm hover:shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{deck.icon || '📚'}</span>
                <Badge variant={deck.mastery >= 80 ? 'mint' : deck.mastery >= 50 ? 'purple' : 'neutral'}>
                  {deck.mastery || deck.progress || 0}% Mastery
                </Badge>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-[#0df2c9] transition-colors">
                {deck.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {deck.description || 'Comprehensive curriculum questions covering fundamental to advanced problem solving.'}
              </p>
            </div>

            <div className="mt-5 space-y-3 pt-3 border-t border-[#1b273a]">
              <ProgressBar
                value={deck.mastery || deck.progress || 0}
                label="Mastery Progress"
                size="sm"
                color={deck.mastery >= 80 ? 'mint' : 'purple'}
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 font-mono">
                  {deck.questionCount || 14} questions
                </span>
                <button
                  onClick={() => handlePractice(deck)}
                  className="px-4 py-2 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Practice Deck
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
