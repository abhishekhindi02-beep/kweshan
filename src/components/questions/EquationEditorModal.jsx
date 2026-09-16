import React, { useState, useEffect } from 'react';
import { Sigma, Check, AlertCircle, Plus } from 'lucide-react';
import Modal from '../common/Modal';
import MathRenderer, { formatMathString } from './MathRenderer';

export default function EquationEditorModal({
  isOpen,
  onClose,
  onSave,
  initialEquation = ''
}) {
  const [equationText, setEquationText] = useState('');
  const [error, setError] = useState('');

  const symbolShortcuts = [
    { label: 'Σ (Sigma)', value: '\\Sigma ' },
    { label: '√ (Sqrt)', value: '\\sqrt{}' },
    { label: 'θ (Theta)', value: '\\theta ' },
    { label: 'π (Pi)', value: '\\pi ' },
    { label: 'Δ (Delta)', value: '\\Delta ' },
    { label: '· (Dot)', value: '\\cdot ' },
    { label: '∫ (Integral)', value: '\\int ' },
    { label: 'a/b (Fraction)', value: '\\frac{a}{b}' },
    { label: 'x² (Square)', value: '^2' },
    { label: 'x³ (Cube)', value: '^3' },
    { label: '± (Plus/Minus)', value: '\\pm ' },
    { label: '≈ (Approx)', value: '\\approx ' },
    { label: 'λ (Lambda)', value: '\\lambda ' },
    { label: 'ω (Omega)', value: '\\omega ' }
  ];

  useEffect(() => {
    if (isOpen) {
      setEquationText(initialEquation || '');
      setError('');
    }
  }, [isOpen, initialEquation]);

  const handleInsertSymbol = (sym) => {
    setEquationText((prev) => prev + sym);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = equationText.trim();
    if (!clean) {
      setError('Please enter a valid mathematical expression or formula.');
      return;
    }
    onSave(clean);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEquation ? 'Edit Formula' : 'Add Equation / Formula'}
      subtitle="Insert mathematical formulas, Cartesian relations, or physical proofs"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
            Equation / LaTeX Notation <span className="text-[#0df2c9]">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={equationText}
            onChange={(e) => {
              setEquationText(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. \Sigma F_x = m \cdot a_x or a = \sqrt{a_x^2 + a_y^2}"
            className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm font-mono text-white placeholder-[#64748b] focus:outline-none transition-colors"
          />
        </div>

        {/* Quick Symbol Buttons */}
        <div>
          <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-2">
            Quick Insert Symbols
          </label>
          <div className="flex flex-wrap gap-1.5">
            {symbolShortcuts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleInsertSymbol(item.value)}
                className="px-2.5 py-1 rounded-lg bg-[#152037] hover:bg-[#1f2f50] text-[#cbd5e1] hover:text-[#0df2c9] text-xs font-mono border border-[#223252] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        {equationText.trim() && (
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1a253c]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#64748b] mb-2">
              Rendered Preview:
            </span>
            <MathRenderer equation={equationText} />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c273e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#152037] hover:bg-[#1a2640] text-[#94a3b8] hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!equationText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{initialEquation ? 'Update Equation' : 'Add Equation'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
